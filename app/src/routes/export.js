/**
 * export.js
 * 
 * Provides the necessary endpoint to generate an executive summary. 
 * 
 * @author Ryan Instrell
 * @package cyban
 */

/** @type { Export } */
const Export = require('../controllers/export'),
    /** @type { ValidatorMiddleware } */
    ValidatorMiddleware = require('../middleware/validator'),
    /** @type { AuthenticatorMiddleware } */
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
    /** @type { Router } */
    router = require('express').Router(),
    // CSRF Protection.
    csurf = require('csurf');

/**
 * @swagger
 * tags:
 *   name: export
 *   description: API Methods for Exports.
 */

/**
 *  @swagger
 *  paths:
 *    /api/export:
 *      get:
 *          summary: Exports to PDF.
 *          description: Exports a summary of all entries to a PDF report.
 *          tags: 
 *            - export
 *          parameters:
 *            - in: cookie
 *              name: token
 *              required: true
 *              schema:
 *                type: string
 *            - in: query
 *              name: filename
 *              description: Filename to export PDF to.
 *              required: true
 *              schema:
 *                type: string
 *          responses:
 *            "200":
 *              description: Exported to PDF.
 *              content:
 *                application/pdf:
 *                  schema:
 *                    type: array
 *                    format: binary
 *            "400":
 *              description: Exportation failed.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: Could not export to PDF.
 *            "403":
 *              description: Not authenticated.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: Not authenticated.
 *            "500":
 *              description: Server-side error.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: Could not export to PDF.
 */
router.get('/', // URI Pattern
    export_limiter, // Rate-limiting
    AuthenticatorMiddleware.checkToken, // Checks for presence of and verifies JWT token 
    ValidatorMiddleware.fileNameValidator(), // Request body validation/sanitisation
    ValidatorMiddleware.validatorReporter, 
    Export.exportToPDF // Controller method
);

module.exports = router;