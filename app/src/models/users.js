/**
 * users.js
 * 
 * Provides a model and schema for Users 'document'.
 * 
 * @author Ryan Instrell
 * @package cyban
 */

// Mongoose API. 
const mongoose = require('mongoose'),
  // Bcrypt module.
  bcrypt = require('bcrypt'),
  // JWT (JSON Web Token) module.
  jwt = require('jsonwebtoken');

// .env / Environment Variables.
require('dotenv').config({ silent : true });

// MongoDB schema for 'Users' document.
/** @type { Schema } */
const usersSchema = new mongoose.Schema({
  username : {
    type : String,
    minlength : 4,
    maxlength : 32,
    required : true,
    unique : true
  },
  password : {
    type : String,
    minlength: 8,
    maxlength: 128,
    required : true
  }
});

// Schema Method - generates a per-user salt.
usersSchema.pre('save', async function () {
  const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_ROUNDS));
  this.password = await bcrypt.hash(this.password, salt);
});

// Schema Method - generates a per-user salt (on the update of a user password).
usersSchema.pre('findOneAndUpdate', async function () {
  const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_ROUNDS));
  this._update.password = await bcrypt.hash(this._update.password, salt);
});

// Schema Method - generates a JWT token (using the username).
usersSchema.methods.createToken = function () {
  return jwt.sign({ username : this.username}, process.env.JWT_TOKEN, { expiresIn : process.env.JWT_TTL });
};

// Schema Method - verifies a stored and supplied password.
usersSchema.methods.verifyPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

/** @type { model } */
const users = mongoose.model('Users', usersSchema);

module.exports = users;