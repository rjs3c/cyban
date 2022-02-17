/**
 * middleware.js
 * 
 * Wrapper for each specific middleware.
 * 
 * @author Ryan Instrell
 * @package cyban
 */

/** @type { AuthenticatorMiddleware } */
const AuthenticatorMiddleware = require('./middleware/authenticator'),
    /** @type { ValidatorMiddleware } */
    ValidatorMiddleware = require('./middleware/validator'),
    /** @type { UnsuccessfulMiddleware } */
    UnsuccessfulMiddleware = require('./middleware/unsuccessful');

module.exports = {
    AuthenticatorMiddleware,
    ValidatorMiddleware,
    UnsuccessfulMiddleware
};