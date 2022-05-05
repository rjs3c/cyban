/**
 * validator.js
 * 
 * Provides a class of validation-based methods.
 * 
 * @author Ryan Instrell
 * @package cyban
 */

// HTTP Status Codes.
const { StatusCodes } = require('http-status-codes'),
    // ExpressJS Validation Middleware.
    { validationResult, check } = require('express-validator');

module.exports = class ValidatorMiddleware {

    /**
     * 
     * Responsible for returning an error message if validation fails.
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    static validatorReporter = (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ 'msg' : 'Validation failed.' });
        }

        next();
    }

    /**
     * Validates entry validation parameters.
     */
    static getEntriesValidator = () => [
        check('entry_search').optional().trim().escape(),
        check('entry_category.*').optional().isIn([
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
        ]),
        check('entry_priority.*').optional().isIn([
            'low',
            'medium',
            'high',
            'notapplicable'
        ])
    ];

    /**
     * Validates entry body parameters.
     */
    static createEntryValidator = () => [
        check('entry_title').exists().isLength({ max : 60 }).escape().not().isEmpty().withMessage('Entry should have a valid title.'),
        check('entry_category').exists().isIn([
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
            'vulnerability'
        ]).not().isEmpty().withMessage('Entry should have a valid category.'),
        check('entry_priority').exists().isIn(['low', 'medium', 'high']).not().isEmpty().withMessage('Entry should have a valid priority.'),
        check('entry_status').exists().isIn(['todo', 'pending', 'done']).not().isEmpty().withMessage('Entry should have a valid status.'),
        check('entry_depends_on').exists().optional().isMongoId().withMessage('Dependency should be a valid ID.')
    ];

    /**
     * Validates entry ID and optional body parameters.
     */
    static editEntryValidator = () => [
        check('id').exists().isMongoId().not().isEmpty().withMessage('Entry ID must be provided.'),
        check('entry_title').exists().optional().isLength({ max : 60 }).escape().withMessage('Entry should have a valid title.'),
        check('entry_category').exists().optional().isIn([
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
            'vulnerability'
        ]).withMessage('Entry should have a valid category.'),
        check('entry_priority').exists().optional().isIn(['low', 'medium', 'high']).not().isEmpty().withMessage('Entry should have a valid priority.'),
        check('entry_status').exists().optional().isIn(['todo', 'pending', 'done']).withMessage('Entry should have a valid status.')
    ];

    /**
     * Validates entry ID to delete.
     */
    static deleteEntryValidator = () => [
        check('id').exists().isMongoId().not().isEmpty().withMessage('Entry ID is not valid.')
    ];

    /**
     * Validates username and password.
     */
     static userValidator = () => [
        check('username').exists().isLength({ min : 4, max : 32 }).escape().not().isEmpty().withMessage('Username is not valid.'),
        check('password').exists().isLength({ min: 8, max : 120 }).not().isEmpty().withMessage('Password is not valid.')
    ];

    /**
     * Validates a user's password.
     */
    static userChangePasswordValidator = () => [
        check('password').exists().isLength({ min: 8, max : 120 }).not().isEmpty().withMessage('Password is not valid.')
    ];

    /**
     * Validates a given filename.
     */
    static fileNameValidator = () => [
        check('filename').exists().isLength({ max : 40 }).escape().not().isEmpty().withMessage('Filename is not valid.')
    ];

    /**
     * Validates a provided page number.
     */
    static pageNumberValidator = () => [
        check('page_num').exists().isInt({ min: 1 }).not().isEmpty().withMessage('Page number is not valid.')
    ];

    /**
     * Validates a given RSS source / URL.
     */
    static rssUrlValidator = () => [
        check('pref_rss_source').exists().isURL().not().isEmpty().withMessage('RSS source is not valid.')
    ];
    
    /**
     * Validates a given RSS search expression.
     */
    static rssSearchValidator = () => [
        check('rss_search').optional().trim().escape()
    ];

    /**
     * Validates ticket creation values.
     */
    static createTicketValidator = () => [
        check('ticket_title').exists().isLength({ min: 4, max : 128 }).escape().not().isEmpty().withMessage('Ticket title is not valid.'),
        check('ticket_priority').exists().isIn(['low', 'medium', 'high']).withMessage('Ticket priority is not valid.')
    ];

    /**
     * Validates ticket modification body.
     */
    static editTicketValidator = () => [
        check('id').exists().isMongoId().not().isEmpty().withMessage('Ticket ID must be provided.'),
        check('ticket_status').exists().isIn(['new', 'open', 'resolved', 'rejected']).withMessage('Ticket status is not valid.')
    ];

    /**
     * Validates ticket deletion id.
     */
     static deleteTicketValidator = () => [
        check('id').exists().isMongoId().not().isEmpty().withMessage('Ticket ID must be provided.'),
    ];
}