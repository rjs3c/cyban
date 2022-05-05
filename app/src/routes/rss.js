/**
 * rss.js
 * 
 * Provides all endpoints for RSS-based operations.
 * 
 * @author Ryan Instrell
 * @package cyban
 */

/** @type { RSS } */
const RSS = require('../controllers/rss'),
    /** @type { ValidatorMiddleware } */
    ValidatorMiddleware = require('../middleware/validator'),
    /** @type { AuthenticatorMiddleware } */
    AuthenticatorMiddleware = require('../middleware/authenticator'),
    // Rate Limiting.
    rateLimit = require('express-rate-limit'),
    rss_limiter = rateLimit({
        windowMs: 60 * 1000,
        max: 30,
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
 *   name: rss
 *   description: API Methods for RSS.
 */

/**
 *  @swagger
 *  paths:
 *    /api/rss:
 *      get:
 *          summary: Retrieves RSS feed.
 *          description: Returns an RSS feed, based upon the RSS source preference specified in MongoDB.
 *          tags: 
 *            - rss
 *          parameters:
 *            - in: cookie
 *              name: token
 *              required: true
 *              schema:
 *                type: string
 *            - in: query
 *              name: rss_search
 *              description: RSS search expression. 
 *              required: false
 *              schema:
 *                type: string
 *          responses:
 *            "200":
 *              description: RSS feed retrieved.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    items:
 *                      rss_feed:
 *                        schema:
 *                          type: object
 *                      rss_title:
 *                        type: string
 *            "400":
 *              description: RSS feed retrieval failed.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: RSS feed could not be retrieved.
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
 *                        example: RSS feed could not be retrieved.
 */
router.get('/', // URI Pattern
    rss_limiter, // Rate-limiting
    AuthenticatorMiddleware.checkToken, // Checks for presence of and verifies JWT token 
    csurf({ cookie : { httpOnly : true, sameSite : 'strict' }, ignoreMethods : ['HEAD', 'OPTIONS']}), // CSRF Protection
    ValidatorMiddleware.rssSearchValidator(), // Request body validation/sanitisation
    ValidatorMiddleware.validatorReporter, 
    RSS.getRSS // Controller method
);

/**
 *  @swagger
 *  paths:
 *    /api/rss:
 *      patch:
 *          summary: Modify RSS source preference.
 *          description: Modifies stored RSS source preference in MongoDB.
 *          tags: 
 *            - rss
 *          parameters:
 *            - in: cookie
 *              name: token
 *              required: true
 *              schema:
 *                type: string
 *            - in: body
 *              name: pref_rss_source
 *              description: New RSS Source
 *              required: true
 *              example: https://feeds.feedburner.com/TheHackersNews?format=xml
 *              schema:
 *                type: string
 *          requestBody:
 *            required: true
 *            content:
 *              application/json:
 *                schema: 
 *                  type: object
 *                  properties:
 *                    pref_rss_source:
 *                      type: string
 *                      description: Nrw RSS Source
 *                      example: https://feeds.feedburner.com/TheHackersNews?format=xml
 *          responses:
 *            "200":
 *              description: RSS source modified.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: RSS feed source changed successfully.
 *            "400":
 *              description: RSS source modification failed.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: RSS feed source could not be changed.
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
 *                        example: RSS feed source could not be changed.
 */
router.patch('/changesource', // URI Pattern
    rss_limiter, // Rate-limiting
    AuthenticatorMiddleware.checkToken, // Checks for presence of and verifies JWT token 
    csurf({ cookie : { httpOnly : true, sameSite : 'strict' }, ignoreMethods : ['HEAD', 'OPTIONS']}), // CSRF Protection
    ValidatorMiddleware.rssUrlValidator(), // Request body validation/sanitisation
    ValidatorMiddleware.validatorReporter, 
    RSS.changeRSS // Controller method
);

module.exports = router;