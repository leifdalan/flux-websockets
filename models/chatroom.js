import {Schema as schema, model} from 'mongoose';

const chatroom = schema({
  user: {
   type: schema.ObjectId,
   ref: 'User'
  },
  title: {type: String},
  created: { type: Date, 'default': Date.now }
});

export default model('ChatRoom', chatroom);
