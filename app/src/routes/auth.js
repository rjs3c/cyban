/**
 * auth.js
 * 
 * Provides all endpoints for authentication-based operations.
 * 
 * @author Ryan Instrell
 * @package cyban
 */

/** @type {Users} */
const Users = require('../controllers/users'),
    /** @type {ValidatorMiddleware} */
    ValidatorMiddleware = require('../middleware/validator'),
    /** @type {AuthenticatorMiddleware} */
    AuthenticatorMiddleware = require('../middleware/authenticator'),
    // Rate Limiting.
    rateLimit = require('express-rate-limit'),
    auth_limiter = rateLimit({
        windowMs: 60 * 1000,
        max: 12,
        message: { 'msg' : 'Rate limit has been reached.' },
        standardHeaders: false,
        legacyHeaders : false
    }),
    /** @type {Router} */
    router = require('express').Router();

// Routes.
router.route('/').get(AuthenticatorMiddleware.checkToken);
router.route('/login').post(auth_limiter, ValidatorMiddleware.userValidator(), ValidatorMiddleware.validatorReporter, Users.loginUser);
router.route('/register').post(auth_limiter, ValidatorMiddleware.userValidator(), ValidatorMiddleware.validatorReporter, Users.registerUser);
router.route('/logout').get(auth_limiter, AuthenticatorMiddleware.checkToken, Users.logoutUser);

module.exports = router;