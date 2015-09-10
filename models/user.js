// load the things we need
const mongoose = require('mongoose');
import bcrypt from 'bcrypt-nodejs';
import uuid from 'uuid';

// define the schema for our user model
/*eslint-disable*/
const userSchema = mongoose.Schema({
/*eslint-enable*/
  groups: Array,
  isValidated: { type: Boolean, 'default': true },
  loginToken: { type: String, 'default': uuid.v4() },
  userLevel: { type: Number, 'default': 1},
  local: {
    username: String,
    password: String
  },
  avatar: {
   type: mongoose.Schema.ObjectId,
   ref: 'Media'
  },
  created: { type: Date, 'default': Date.now },
  lastUpdated: { type: Date, 'default': Date.now }
});

// generating a hash
userSchema.methods.generateHash = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);


// checking if password is valid
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.generateToken = () => uuid.v4();


// create the model for users and expose it to our app
export default mongoose.model('User', userSchema);
