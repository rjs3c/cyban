/**
 * entries.js
 * 
 * Provides all endpoints for entry-based operations.
 * 
 * @author Ryan Instrell
 * @package cyban
 */

/** @type {Entries} */
const Entries = require('../controllers/entries'),
    /** @type {ValidatorMiddleware} */
    ValidatorMiddleware = require('../middleware/validator'),
    /** @type {AuthenticatorMiddleware} */
    AuthenticatorMiddleware = require('../middleware/authenticator'),
    // Rate Limiting. 
    rateLimit = require('express-rate-limit'),
    entries_limiter = rateLimit({
        windowMs: 60 * 1000,
        max: 300,
        message: { 'msg' : 'Rate limit has been reached.' },
        standardHeaders: false,
        legacyHeaders : false
    }),
    /** @type {Router} */
    router = require('express').Router();

// Routes. 
router.route('/').get(entries_limiter, ValidatorMiddleware.getEntriesValidator(), ValidatorMiddleware.validatorReporter, Entries.getEntries).post(entries_limiter, AuthenticatorMiddleware.checkToken, ValidatorMiddleware.createEntryValidator(), ValidatorMiddleware.validatorReporter, Entries.createEntry);
router.route('/:id').patch(entries_limiter, AuthenticatorMiddleware.checkToken, ValidatorMiddleware.editEntryValidator(), ValidatorMiddleware.validatorReporter, Entries.updateEntry).delete(entries_limiter, AuthenticatorMiddleware.checkToken, ValidatorMiddleware.deleteEntryValidator(), ValidatorMiddleware.validatorReporter, Entries.deleteEntry);

module.exports = router;