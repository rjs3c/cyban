/**
 * unsuccessful.js
 * 
 * Provides numerous routes for unsuccessful requests. 
 * 
 * @author Ryan Instrell
 * @package cyban
 */

// HTTP Status Codes.
const { StatusCodes } = require('http-status-codes');

module.exports = class UnsuccessfulMiddleware {
    
    /**
     * Middleware that checks for a non-existent page.
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    static notFound (req, res, next) {
        if (!res.headersSent) return res
        .status(StatusCodes.NOT_FOUND)
        .json({ 'msg' : 'Not found.' });
    }

    /**
     * Middleware that checks for invalid HTTP methods.
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    static methodNotAcceptable (req, res, next) {
        // Allowlisting specific HTTP methods.
        if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(req.method)) return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ 'msg' : 'HTTP method not accepted.' });

        next();
    }
 }