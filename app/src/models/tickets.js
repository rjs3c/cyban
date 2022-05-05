/**
 * tickets.js
 * 
 * Provides a model and schema for Tickets 'document'.
 * 
 * @author Ryan Instrell
 * @package cyban
 */

// Mongoose API.
const mongoose = require('mongoose'),
  // MongoDB schema for 'Logs' document.
  /** @type { Schema } */
  TicketsSchema = new mongoose.Schema({
    ticket_title : {
        type : String,
        minlength : 4,
        maxlength : 128,
        required : true
    },
    ticket_status : {
        type : String,
        enum : ['new', 'open', 'resolved', 'rejected'],
        default : 'new',
    },
    ticket_priority : {
        type : String,
        enum : ['low', 'medium', 'high'],
        required : true 
    }
  }, { timestamps : true });

module.exports = mongoose.model('Tickets', TicketsSchema);