// import fs from 'fs';
// import path from 'path';
import cloudinaryClient from 'cloudinary';
import config from '../config';
import http from 'http';
import knox from 'knox';
import uuid from 'uuid';
import Media from '../models/media';
import User from '../models/user';
import path from 'path';
const debug = require('debug')('Server:Upload');

var s3client = knox.createClient({
  key: config.AWS_KEY,
  secret: config.AWS_SECRET,
  bucket: config.AWS_BUCKET
});

/*eslint-disable*/
cloudinaryClient.config({
  cloud_name: config.CLOUD_NAME,
  api_key: config.CLOUD_API_KEY,
  api_secret: config.CLOUD_SECRET
});
/*eslint-enable*/

const sizes = [{
    width: 304,
    height: 304,
    crop: 'fill',
    gravity: 'face',
    format: 'jpg',
    type: 'retina'
  },

  {
    width: 152,
    height: 152,
    crop: 'fill',
    gravity: 'face',
    format: 'jpg',
    type: 'medium'
  },
  {
    width: 71,
    height: 71,
    crop: 'fill',
    gravity: 'face',
    format: 'jpg',
    type: 'thumb'
    }
];


export default function(req, res, next) {
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
    req.busboy.on('file', (fieldname, file, ...args) => {
      const [filename, farts, mimetype] = args;
      debug(farts);
      debug(mimetype);
      const unique = uuid.v4();
      const extension = path.extname(filename);
      const uniqueFilename = `${filename}-${unique}`;
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

      file.pipe(cloudStream);

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
  req.pipe(req.busboy);
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

export function singleS3Push({cloudObj, publicId, io, socketId, i, format}) {

  return new Promise((resolve, reject) => {

    const gettingCloudObj = http.get(cloudObj.url, (cloudRes) => {
      debug('CONTENT LENGTH', cloudRes.headers['content-length']);
      const total = cloudRes.headers['content-length'];
      var progress = 0;
      const headers = {
        'Content-Length': total,
        'Content-Type': cloudRes.headers['content-type'],
        'x-amz-acl': 'public-read'
      };
      const filename = `${publicId}${cloudObj.width}x${cloudObj.height}.${sizes[i].format}`;
      const s3Req = s3client.put(filename, headers, (s3err, s3Res) => {
        if (s3err) {
          debug(s3err);
        } else {
          debug(s3Res);
        }
      });

      // s3Req.on('progress', (written, total, percent) => {
      //   debug(written);
      //   debug(total);
      //   debug(percent);
      //   debug('DATA FROM S3');
      // });

      cloudRes.pipe(s3Req);

      cloudRes.on('response', (cRes) => {
        debug('cloud response', cRes);
      });


      cloudRes.on('data', (data) => {
        progress += data.length;
        io.to(socketId).emit(
          'progress',
          `cloudRes${i}`,
          progress / total
        );
      });

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

function createMediaRecord({original, thumb, medium, retina}) {
  return new Promise((resolve, reject) => {
    const newMedia = {original, thumb, medium, retina};
    Media.create(newMedia, (error, newMediaRecord) => {
      if (error) {
        reject(error);
      } else {
        resolve(newMediaRecord);
      }
    });
  });
}


export function s3(req, res, next) {
  const {
    eager: cloudSizes,
    socketId,
    format,
    height,
    width
  } = req.body;
  debug(req.body);
  let promises = [];
  cloudSizes.map((size, i) => {
    promises.push(singleS3Push({
        cloudObj: size,
        io: this,
        publicId: req.body.public_id,
        format,
        socketId,
        i
      })
    );
  }.bind(this));
  Promise.all(promises).then((resArray) => {
    debug('ALL DONE!!!');
    let bodyObj = {};
    resArray.forEach(({filename, meta}) => {
      bodyObj[meta.type] = {
        width: meta.width,
        height: meta.height,
        filename
      };
      bodyObj.original = {
        height,
        width,
        filename: `${req.body.public_id}.${format}`
      };
      debug(meta, filename);

    });
    createMediaRecord(bodyObj).then( (record) => {
      debug('RECORD!!!', record);
      if (req.user) {
        debug(req.user);
        User.findByIdAndUpdate(req.user._id, {avatar: record._id}, {'new': true})
          .populate('avatar')
          .exec((userError, userSchema) => {
          if (userError) {
            debug(userError);
          } else {
            res.json(userSchema);
            debug(userSchema);
          }
        });
      }
    });

  });

}
