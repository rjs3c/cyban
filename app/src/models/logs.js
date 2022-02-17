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
  logs = mongoose.model('Logs', new mongoose.Schema({
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
    }
  }, { timestamps : true }, { expires : '7d' }));

module.exports = logs;