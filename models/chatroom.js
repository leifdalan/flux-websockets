const mongoose = require('mongoose');

/*eslint-disable*/
const chatroom = mongoose.Schema({
/*eslint-enable*/
  user: {
   type: mongoose.Schema.ObjectId,
   ref: 'User'
  },
  title: {type: String},
  created: { type: Date, 'default': Date.now }
});

export default mongoose.model('ChatRoom', chatroom);
