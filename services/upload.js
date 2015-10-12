import cloudinaryClient from 'cloudinary';
import config from '../config';
import http from 'http';
import knox from 'knox';
import uuid from 'uuid';
import Media from '../models/media';
import path from 'path';
const debug = require('debug')('Server:Upload');

const {
  AWS_KEY,
  AWS_SECRET,
  AWS_BUCKET,
  CLOUD_NAME,
  CLOUD_API_KEY,
  CLOUD_SECRET
} = config;

var s3client = knox.createClient({
  key: AWS_KEY,
  secret: AWS_SECRET,
  bucket: AWS_BUCKET
});

/*eslint-disable*/
cloudinaryClient.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_SECRET
});
/*eslint-enable*/

const sizes = [{
    width: 1024,
    format: 'jpg',
    type: 'retina'
  },
  {
    width: 768,
    crop: 'fill',
    format: 'jpg',
    type: 'medium'
  },
  {
    width: 320,
    crop: 'fill',
    format: 'jpg',
    type: 'mobile'
  },
  {
    width: 1024,
    format: 'webp',
    type: 'retinaWebp'
  },
  {
    width: 768,
    crop: 'fill',
    format: 'webp',
    type: 'mediumWebp'
  },
  {
    width: 320,
    crop: 'fill',
    format: 'webp',
    type: 'mobileWebp'
  }
];


export default function(req, res) {
  const total = req.headers['content-length'];
  const socketId = req.headers['x-socketid'];
  debug(total);
  /*eslint-disable*/
  const io = this;
  /*eslint-enable*/
  let progress = 0;
  if (total > 5000000) {
    return res.status(400).json({
      message: 'File must be less than 5MB'
    });
  }
  if (req.busboy) {
    // Multi-part http handler
    req.busboy.on('file', (fieldname, file, ...args) => {
      const [filename, farts, mimetype] = args;
      debug(farts);
      debug(mimetype);
      const unique = uuid.v4();
      const extension = path.extname(filename);
      const filenameNoSpaces = filename.replace(' ', '_');
      const uniqueFilename = `${filenameNoSpaces.replace(extension, '')}-${unique}`;

      // Stream content to cloudinary API
      const cloudStream = cloudinaryClient.uploader.upload_stream((result) => {
        debug('All done with upload to cloudinaryClient.');
        if (result.error) {
          res.status(result.error.http_code).json(result.error);
        } else {
          res.json(result);
        }
      },
      {
        /*eslint-disable*/
        public_id: uniqueFilename,
        /*eslint-enable*/
        crop: 'limit',
        width: 2000,
        height: 2000,
        eager: sizes
      });

      // Pipe file reading into the cloudinary client.
      file.pipe(cloudStream);

      // Collect buffer to upload the original to s3
      file.fileRead = [];
      file.on('data', (chunk) => {
        file.fileRead.push(chunk);
      });

      const headers = {
        'Content-Length': total,
        'Content-Type': req.headers['content-type'],
        'x-amz-acl': 'public-read'
      };

      file.on('end', () => {
        // Push original upload to s3 via stream.
        const finalBuffer = Buffer.concat(file.fileRead);
        const s3Req = s3client.putBuffer(
          finalBuffer,
          `${uniqueFilename}${extension}`,
          headers,
          (s3err) => {
          if (s3err) {
            debug(s3err);
          } else {
            debug('s3 done.................');
          }
        });

        s3Req.on('response', (s3Res) => {
          if (s3Res.statusCode !== 200) {
            return res.status(400).json({
              message: 'Original could not be uploaded.'
            });
          }
          debug('S3 original uploaded========================');
        });

      });

      // Publish incremental progress to client-only socket.io room
      let cloudStreamProgress = 0;
      cloudStream.on('data', (cloudStreamData) => {
        cloudStreamProgress += cloudStreamData.length;
        io.to(socketId).emit(
          'progress',
          'cloudStream',
          cloudStreamProgress / total
        );
      });
    });
  }

  // Pipe request to multipart handler
  req.pipe(req.busboy);

  // Publish progress from client to server back to client
  // for progress bar
  req.on('data', (reqData) => {
    debug(reqData.length);
    progress += reqData.length;
    debug('from client:', progress / total);
    io.to(socketId).emit(
      'progress',
      'clientUpload',
      progress / total
    );
  });

}

export function singleS3Push({cloudObj, publicId, io, socketId, i}) {
  debug('socketId', socketId);
  return new Promise((resolve, reject) => {

    // Retrieve image data from cloudinary
    const gettingCloudObj = http.get(cloudObj.url, (cloudRes) => {
      debug('CONTENT LENGTH', cloudRes.headers['content-length']);
      const total = cloudRes.headers['content-length'];
      var progress = 0;
      const headers = {
        'Content-Length': total,
        'Content-Type': cloudRes.headers['content-type'],
        'x-amz-acl': 'public-read'
      };
      const underscores = publicId.replace(' ', '_');
      const filename = `${underscores}${cloudObj.width}x${cloudObj.height}.${sizes[i].format}`;
      const s3Req = s3client.put(filename, headers, (s3err, s3Res) => {
        if (s3err) {
          debug(s3err);
        } else {
          debug(s3Res);
        }
      });

      // Pipe read buffer into knox upload
      cloudRes.pipe(s3Req);

      cloudRes.on('response', (cRes) => {
        debug('cloud response', cRes);
      });

      // Report progress to client
      cloudRes.on('data', (data) => {
        progress += data.length;
        debug('CloudResData', progress / total);
        io.to(socketId).emit(
          'progress',
          `cloudRes${i}`,
          progress / total
        );
      });

      // Resolve/reject promise
      s3Req.on('response', (s3Res, b, c) => {
        if (s3Res.statusCode !== 200) {
          reject(s3Res);
        }
        debug(b);
        debug(c);
        resolve({
          filename,
          s3Res,
          meta: sizes[i]
        });
      });
    });

    gettingCloudObj.on('error', (error) => {
      debug('HTTP GET for cloudinary', i);
      reject(error);
    });
  });
}

function createMediaRecord(
  {original, mobile, medium, retina, mobileWebp, mediumWebp, retinaWebp}) {
  return new Promise((resolve, reject) => {
    const newMedia = {
      original,
      mobile,
      medium,
      retina,
      mobileWebp,
      mediumWebp,
      retinaWebp
    };
    Media.create(newMedia, (error, newMediaRecord) => {
      if (error) {
        reject(error);
      } else {
        resolve(newMediaRecord);
      }
    });
  });
}


export function s3(req, res) {
  const {
    eager: cloudSizes,
    socketId,
    format,
    height,
    width
  } = req.body;
  debug(req.body);
  let promises = [];

  // For each specified size, push a namespaced version to S3.
  cloudSizes.map((size, i) => {
    promises.push(singleS3Push({
      cloudObj: size,
      io: this,
      publicId: req.body.public_id,
      format,
      socketId,
      i
    }));
  });

  // When all promises have been fulfilled, send an HTTP response.
  Promise.all(promises).then((resArray) => {
    debug('ALL DONE!!!');
    let bodyObj = {};
    resArray.forEach(({filename, meta}, i) => {
      bodyObj[meta.type] = {
        width: cloudSizes[i].width,
        height: cloudSizes[i].height,
        filename
      };
      bodyObj.original = {
        height,
        width,
        filename: `${req.body.public_id}.${format}`
      };
      debug(meta, filename);

    });
    createMediaRecord(bodyObj).then(record => {
      debug('RECORD!!!', record);
      res.json(record);
    });
  });
}
