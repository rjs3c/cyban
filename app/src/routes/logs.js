/**
 * logs.js
 * 
 * Provides all endpoints for log-based operations.
 * 
 * @author Ryan Instrell
 * @package cyban
 */

/** @type { Logs } */
const Logs = require('../controllers/logs'),
    /** @type { ValidatorMiddleware } */
    ValidatorMiddleware = require('../middleware/validator'),
    /** @type { AuthenticatorMiddleware } */
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
    /** @type { Router } */
    router = require('express').Router(),
    // CSRF Protection.
    csurf = require('csurf');

/**
 * @swagger
 * tags:
 *   name: logs
 *   description: API Methods for Logs.
 */

/**
 *  @swagger
 *  paths:
 *    /api/logs:
 *      get:
 *          summary: Retrieves logs.
 *          description: Returns all logs stored in MongoDB.
 *          tags: 
 *            - logs
 *          parameters:
 *            - in: cookie
 *              name: token
 *              required: true
 *              schema:
 *                type: string
 *            - in: query
 *              name: page_num
 *              description: Page number of logs display. 
 *              required: true
 *              schema:
 *                type: string
 *          responses:
 *            "200":
 *              description: Logs retrieved.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    items:
 *                      logs_count:
 *                        type: integer
 *                      logs_list:
 *                        type: array
 *                        items:
 *                          type: object
 *            "400":
 *              description: Logs retrieval failed.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: Logs could not be retrieved.
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
 *                        example: Logs could not be retrieved.
 */
router.get('/', // URI Pattern
    logs_limiter, // Rate-limiting
    AuthenticatorMiddleware.checkToken, // Checks for presence of and verifies JWT token 
    csurf({ cookie : { httpOnly : true, sameSite : 'strict' }, ignoreMethods : ['HEAD', 'OPTIONS']}), // CSRF Protection
    ValidatorMiddleware.pageNumberValidator(), // Request body validation/sanitisation
    ValidatorMiddleware.validatorReporter, 
    Logs.getLogs // Controller method
);

/**
 *  @swagger
 *  paths:
 *    /api/logs/performance:
 *      get:
 *          summary: Retrieve a performance overview based upon the logs.
 *          description: Calculates performance-based metrics based upon the logs stored in MongoDB.
 *          tags: 
 *            - logs
 *          parameters:
 *            - in: cookie
 *              name: token
 *              required: true
 *              schema:
 *                type: string
 *          responses:
 *            "200":
 *              description: Performance overview retrieved.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    items:
 *                      user_performance:
 *                        type: object
 *                      user_performance_averages:
 *                        type: object
 *            "400":
 *              description: Performance overview retrieval failed.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: Performance overview could not be retrieved.
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
 *                        example: Performance overview could not be retrieved.
 */
router.get('/performance', // URI Pattern
    logs_limiter, // Rate-limiting
    AuthenticatorMiddleware.checkToken, // Checks for presence of and verifies JWT token 
    csurf({ cookie : { httpOnly : true, sameSite : 'strict' }, ignoreMethods : ['HEAD', 'OPTIONS']}), // CSRF Protection
    Logs.getUserPerformance // Controller method
);

module.exports = router;