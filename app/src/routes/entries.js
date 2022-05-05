/**
 * entries.js
 * 
 * Provides all endpoints for entry-based operations.
 * 
 * @author Ryan Instrell
 * @package cyban
 */

/** @type { Entries } */
const Entries = require('../controllers/entries'),
    /** @type { ValidatorMiddleware } */
    ValidatorMiddleware = require('../middleware/validator'),
    /** @type { AuthenticatorMiddleware } */
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
    /** @type { Router } */
    router = require('express').Router(),
    // CSRF Protection.
    csurf = require('csurf');

/**
 * @swagger
 * tags:
 *   name: entries
 *   description: API Methods for Entries.
 */

/**
 *  @swagger
 *  paths:
 *    /api/entries:
 *      get:
 *          summary: Retrieves entries.
 *          description: Returns all entries stored in MongoDB.
 *          tags: 
 *            - entries
 *          responses:
 *            "200":
 *              description: All retrieved entries.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: array
 *                    items:
 *                      type: object
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
 *                        example: Entries could not be retrieved.
 */
router.get('/', // URI Pattern
    entries_limiter, // Rate-limiting
    ValidatorMiddleware.getEntriesValidator(), // Request body validation/sanitisation
    ValidatorMiddleware.validatorReporter, 
    Entries.getEntries // Controller method
);

/**
 *  @swagger
 *  paths:
 *    /api/entries:
 *      post:
 *          summary: Create an entry.
 *          description: Creates a new entry document in MongoDB.
 *          tags: 
 *            - entries
 *          parameters:
 *            - in: cookie
 *              name: token
 *              required: true
 *              schema:
 *                type: string
 *            - in: body
 *              name: entry_title
 *              description: Entry Title
 *              required: true
 *              example: Test Entry Title
 *              schema:
 *                type: string
 *            - in: body
 *              name: entry_category
 *              description: Entry Category
 *              required: true
 *              example: vulnerability
 *              schema:
 *                type: string
 *                enum:
 *                  - control
 *                  - dp
 *                  - dr
 *                  - event
 *                  - grc
 *                  - ir
 *                  - patch
 *                  - privacy
 *                  - risk
 *                  - test
 *                  - ta
 *                  - vulnerability
 *            - in: body
 *              name: entry_priority
 *              description: Entry Priority
 *              required: true
 *              example: medium
 *              schema:
 *                type: string
 *                enum:
 *                  - low
 *                  - medium
 *                  - high
 *            - in: body
 *              name: entry_status
 *              description: Entry Status
 *              required: true
 *              example: todo
 *              schema:
 *                type: string
 *                enum:
 *                  - todo
 *                  - pending
 *                  - done
 *            - in: body
 *              name: entry_depends_on
 *              description: Entry Dependency (Child Entry)
 *              required: false
 *              example: 61b9f863ac740c5544075304
 *              schema:
 *                type: string
 *          requestBody:
 *            required: true
 *            content:
 *              application/json:
 *                schema: 
 *                  type: object
 *                  properties:
 *                    entry_title:
 *                      type: string
 *                      description: Entry Title
 *                      example: Test Entry Title
 *                    entry_category:
 *                      type: string
 *                      description: Entry Category
 *                      example: vulnerability
 *                    entry_priority:
 *                      type: string
 *                      description: Entry Priority
 *                      example: medium
 *                    entry_status:
 *                      type: string
 *                      description: Entry Status
 *                      example: todo
 *          responses:
 *            "200":
 *              description: Entry created.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: Entry created successfully.   
 *            "400":
 *              description: Entry creation failed.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: Entry could not be created.
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
 *                        example: Entry could not be created.
 */
router.post('/', // URI Pattern
    entries_limiter, // Rate-limiting
    AuthenticatorMiddleware.checkToken, 
    csurf({ cookie : { httpOnly : true, sameSite : 'strict' }, ignoreMethods : ['HEAD', 'OPTIONS']}), // CSRF Protection
    ValidatorMiddleware.createEntryValidator(), // Request body validation/sanitisation
    ValidatorMiddleware.validatorReporter, 
    Entries.createEntry // Controller method
);

/**
 *  @swagger
 *  paths:
 *    /api/entries/{id}:
 *      patch:
 *          summary: Modify an entry.
 *          description: Modifies an existing entry document in MongoDB.
 *          tags: 
 *            - entries
 *          parameters:
 *            - in: cookie
 *              name: token
 *              required: true
 *              schema:
 *                type: string
 *            - in: path
 *              name: id
 *              description: Entry ID.
 *              required: true
 *              schema:
 *                type: string
 *            - in: body
 *              name: entry_title
 *              description: Entry Title
 *              required: false
 *              example: Test Entry Title
 *              schema:
 *                type: string
 *            - in: body
 *              name: entry_category
 *              description: Entry Category
 *              required: false
 *              example: vulnerability
 *              schema:
 *                type: string
 *                enum:
 *                  - control
 *                  - dp
 *                  - dr
 *                  - event
 *                  - grc
 *                  - ir
 *                  - patch
 *                  - privacy
 *                  - risk
 *                  - test
 *                  - ta
 *                  - vulnerability
 *            - in: body
 *              name: entry_priority
 *              description: Entry Priority
 *              required: false
 *              example: medium
 *              schema:
 *                type: string
 *                enum:
 *                  - low
 *                  - medium
 *                  - high
 *            - in: body
 *              name: entry_status
 *              description: Entry Status
 *              required: false
 *              example: todo
 *              schema:
 *                type: string
 *                enum:
 *                  - todo
 *                  - pending
 *                  - done
 *          requestBody:
 *            required: true
 *            content:
 *              application/json:
 *                schema: 
 *                  type: object
 *                  properties:
 *                    entry_title:
 *                      type: string
 *                      description: Entry Title
 *                      example: Test Entry Title
 *                    entry_category:
 *                      type: string
 *                      description: Entry Category
 *                      example: vulnerability
 *                    entry_priority:
 *                      type: string
 *                      description: Entry Priority
 *                      example: medium
 *                    entry_status:
 *                      type: string
 *                      description: Entry Status
 *                      example: todo
 *          responses:
 *            "200":
 *              description: Entry modified.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: Entry created successfully.   
 *            "400":
 *              description: Entry modification failed.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: Entry could not be updated.
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
 *                        example: Entry could not be updated.
 */
router.patch('/:id', // URI Pattern
    entries_limiter, // Rate-limiting
    AuthenticatorMiddleware.checkToken, // Checks for presence of and verifies JWT token 
    csurf({ cookie : { httpOnly : true, sameSite : 'strict' }, ignoreMethods : ['HEAD', 'OPTIONS']}), // CSRF Protection
    ValidatorMiddleware.editEntryValidator(), // Request body validation/sanitisation
    ValidatorMiddleware.validatorReporter, 
    Entries.updateEntry // Controller method
);

/**
 *  @swagger
 *  paths:
 *    /api/entries/{id}:
 *      delete:
 *          summary: Delete an entry.
 *          description: Deletes an existing entry document in MongoDB.
 *          tags: 
 *            - entries
 *          parameters:
 *            - in: cookie
 *              name: token
 *              required: true
 *              schema:
 *                type: string
 *            - in: path
 *              name: id
 *              description: Entry ID.
 *              required: true
 *              schema:
 *                type: string
 *          responses:
 *            "200":
 *              description: Entry deleted.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: Entry successfully deleted. 
 *            "400":
 *              description: Entry deletion failed.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: Entry could not be deleted.
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
 *                        example: Entry could not be deleted.
 */
router.delete('/:id', // URI Pattern
    entries_limiter, // Rate-limiting
    AuthenticatorMiddleware.checkToken, // Checks for presence of and verifies JWT token 
    csurf({ cookie : { httpOnly : true, sameSite : 'strict' }, ignoreMethods : ['HEAD', 'OPTIONS']}), // CSRF Protection
    ValidatorMiddleware.deleteEntryValidator(), // Request body validation/sanitisation
    ValidatorMiddleware.validatorReporter, 
    Entries.deleteEntry // Controller method
);

module.exports = router;