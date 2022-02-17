/**
 * entries.js
 * 
 * Provides a model and schema for Entries 'document'.
 * 
 * @author Ryan Instrell
 * @package cyban
 */

// Mongoose API.
const mongoose = require('mongoose'),
  // MongoDB schema for 'Entries' document.
  /** @type { Schema } */
  entriesSchema = new mongoose.Schema({
    entry_title : {
      type : String,
      maxlength : 60,
      required : true
    },
    entry_category : {
      type : String,
      enum : [
        'control',
        'dp', // Data Protection
        'dr', // Disaster Recovery
        'event',
        'grc', // Governance, Risk Mgmnt., Compliance
        'ir', // Incident Response
        'patch',
        'privacy',
        'risk',
        'test',
        'ta', // Training/Awareness
        'vulnerability',
        'notapplicable'
      ],
      required : true
    },
    entry_status : {
      type : String,
      enum : ['todo', 'pending', 'done'],
      required : true
    },
    entry_priority : {
      type : String,
      enum : ['low', 'medium', 'high', 'notapplicable'],
      required : true
    },
    entry_depends_on : {
      type : mongoose.Schema.Types.ObjectId,
      required : false
    }
  }, { timestamps : true }),
  entries = mongoose.model('Entries', entriesSchema);

module.exports = entries;