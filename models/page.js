// load the things we need
const mongoose = require('mongoose');

// define the schema for our user model
/*eslint-disable*/
const pageSchema = mongoose.Schema({
  isPublished: { type: Boolean, 'default': true },
  created: { type: Date, 'default': Date.now },
  lastUpdated: { type: Date, 'default': Date.now },
  slug: { type: String},
  content: {
    type: String,
    'default': '',
    trim: true
  },
  title: {
    type: String,
    'default': '',
    trim: true,
    required: 'Title cannot be blank'
  },
  user: {
   type: mongoose.Schema.ObjectId,
   ref: 'User'
 },
 blocks: {
   type: Array
 }
});

// create the model for users and expose it to our app
export default mongoose.model('Page', pageSchema);
/*eslint-enable*/
