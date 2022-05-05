/**
 * authenticator.js
 * 
 * Provides numerous routes for unsuccessful requests. 
 * 
 * @author Ryan Instrell
 * @package cyban
 */

// HTTP Status Codes module.
const { StatusCodes } = require('http-status-codes'),
    // JWT (JSON Web Token) module.
    jwt = require('jsonwebtoken'),
    csurf = require('csurf');

module.exports = class AuthenticatorMiddleware {

    /**
     * 
     * Responsible for returning an error message if verification fails.
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    static checkToken (req, res, next) {
        const token = req.cookies.token;

        if (!token) return res
        .status(StatusCodes.FORBIDDEN)
        .json({ 'msg' : 'Not authenticated.' });

        // Verifies a JWT if set in HTTP cookies.
        jwt.verify(token, process.env.JWT_TOKEN, (err, data) => {
            if (err) return res
            .status(StatusCodes.FORBIDDEN)
            .json({ 'msg' : 'Not authenticated.' });
            
            req.user = data;

            next();
        });
    }
}