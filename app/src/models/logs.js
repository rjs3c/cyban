/**
 * logs.js
 * 
 * Provides a model and schema for Logs 'document'.
 * 
 * @author Ryan Instrell
 * @package cyban
 */

// Mongoose API.
const mongoose = require('mongoose'),
  // MongoDB schema for 'Logs' document.
  /** @type { Schema } */
  LogsSchema = new mongoose.Schema({
    user : {
        type : String,
        minlength : 4,
        maxlength : 32,
        required : true
    },
    action : {
        type : String,
        enum : ['created', 'deleted', 'modified'],
        required : true
    },
    expireAt : {
        type : Date,
        default : new Date(new Date().valueOf() + 604800000),
        expires : 60
    }
  }, { timestamps : true });

module.exports = mongoose.model('Logs', LogsSchema);