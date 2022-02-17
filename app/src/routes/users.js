/**
 * users.js
 * 
 * Provides all endpoints for user-based management operations.
 * 
 * @author Ryan Instrell
 * @package cyban
 */

/** @type { Users } */
const Users = require('../controllers/users'),
    /** @type { ValidatorMiddleware } */
    ValidatorMiddleware = require('../middleware/validator'),
    /** @type { AuthenticatorMiddleware } */
    AuthenticatorMiddleware = require('../middleware/authenticator'),
    // Rate Limiting.
    rateLimit = require('express-rate-limit'),
    users_limiter = rateLimit({
        windowMs: 60 * 1000,
        max: 10,
        message: { 'msg' : 'Rate limit has been reached.' },
        standardHeaders: false,
        legacyHeaders : false
    }),
    /** @type {Router} */
    router = require('express').Router();

// Routes.
router.route('/changepassword').patch(users_limiter, AuthenticatorMiddleware.checkToken, ValidatorMiddleware.userChangePasswordValidator(), ValidatorMiddleware.validatorReporter, Users.changeUserPassword);
router.route('/delete').delete(users_limiter, AuthenticatorMiddleware.checkToken, Users.deleteUser);

module.exports = router;