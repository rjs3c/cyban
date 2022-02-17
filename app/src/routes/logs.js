/**
 * logs.js
 * 
 * Provides all endpoints for log-based operations.
 * 
 * @author Ryan Instrell
 * @package cyban
 */

/** @type {Users} */
const Logs = require('../controllers/logs'),
    /** @type {ValidatorMiddleware} */
    ValidatorMiddleware = require('../middleware/validator'),
    /** @type {AuthenticatorMiddleware} */
    AuthenticatorMiddleware = require('../middleware/authenticator'),
    // Rate Limiting.
    rateLimit = require('express-rate-limit'),
    logs_limiter = rateLimit({
        windowMs: 60 * 1000,
        max: 300,
        message: { 'msg' : 'Rate limit has been reached.' },
        standardHeaders: false,
        legacyHeaders : false
    }),
    /** @type {Router} */
    router = require('express').Router();

// Route.
router.route('/').get(logs_limiter, ValidatorMiddleware.pageNumberValidator(), ValidatorMiddleware.validatorReporter, AuthenticatorMiddleware.checkToken, Logs.getLogs);

module.exports = router;