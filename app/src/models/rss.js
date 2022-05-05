/**
 * rss.js
 * 
 * Provides a model and schema for RSS 'document'.
 * 
 * @author Ryan Instrell
 * @package cyban
 */

// Mongoose API.
const mongoose = require('mongoose');
// URL-type for Mongoose Schema.
require('mongoose-type-url');

// MongoDB schema for 'Logs' document.
/** @type { Schema } */
const rss = mongoose.model('RSS', new mongoose.Schema({
    user : {
        type : String,
        minlength : 4,
        maxlength : 32,
        required : true,
        unique : true
    },
    pref_rss_source : {
        type : mongoose.SchemaTypes.Url,
        required : true
     }
}));

module.exports = rss;