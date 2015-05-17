const mongoose = require('mongoose');

const chatroom = mongoose.Schema({
  user: {
   type: mongoose.Schema.ObjectId,
   ref: 'User'
  },
  title: {type: String},
  created: { type: Date, 'default': Date.now }
});

export default mongoose.model('ChatRoom', chatroom);
