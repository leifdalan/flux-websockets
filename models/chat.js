const mongoose = require('mongoose');
/*eslint-disable*/
const chat = mongoose.Schema({
/*eslint-enable*/
  user: {
   type: mongoose.Schema.ObjectId,
   ref: 'User'
  },
  content: {type: String},
  created: { type: Date, 'default': Date.now },
  room: {type: String}
});

export default mongoose.model('Chat', chat);
