// load the things we need
const mongoose = require('mongoose');


/*eslint-disable*/
// define the schema for our user model
/*eslint-disable*/
const mediaSchema = mongoose.Schema({
/*eslint-enable*/
  original: {
    width: Number,
    height: Number,
    filename: String
  },
  thumb: {
    width: Number,
    height: Number,
    filename: String
  },
  medium: {
    width: Number,
    height: Number,
    filename: String
  },
  retina: {
    width: Number,
    height: Number,
    filename: String
  },
  created: { type: Date, 'default': Date.now },
  lastUpdated: { type: Date, 'default': Date.now }
});


// create the model for users and expose it to our app
export default mongoose.model('Media', mediaSchema);
