/**
 * export.js
 * 
 * Provides the necessary endpoint to generate an executive summary. 
 * 
 * @author Ryan Instrell
 * @package cyban
 */

/** @type {Users} */
const Export = require('../controllers/export'),
    /** @type {ValidatorMiddleware} */
    ValidatorMiddleware = require('../middleware/validator'),
    /** @type {AuthenticatorMiddleware} */
    AuthenticatorMiddleware = require('../middleware/authenticator'),
    // Rate Limiting.
    rateLimit = require('express-rate-limit'),
    export_limiter = rateLimit({
        windowMs: 60 * 1000,
        max: 20,
        message: { 'msg' : 'Rate limit has been reached.' },
        standardHeaders: false,
        legacyHeaders : false
    }),
    /** @type {Router} */
    router = require('express').Router();

// Route.
router.route('/').get(export_limiter, AuthenticatorMiddleware.checkToken, ValidatorMiddleware.fileNameValidator(), ValidatorMiddleware.validatorReporter, Export.exportToPDF);

module.exports = router;