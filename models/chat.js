import {Schema as schema, model} from 'mongoose';

const chat = schema({
  user: {
   type: schema.ObjectId,
   ref: 'User'
  },
  content: {type: String},
  created: { type: Date, 'default': Date.now }
});

export default model('Chat', chat);
