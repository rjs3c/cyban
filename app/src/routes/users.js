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
    /** @type { Router } */
    router = require('express').Router(),
    // CSRF Protection.
    csurf = require('csurf');

/**
 * @swagger
 * tags:
 *   name: users
 *   description: API Methods for Users.
 */

/**
 *  @swagger
 *  paths:
 *    /api/users/changepassword:
 *      patch:
 *          summary: Modify password.
 *          description: Modifies the password of an existing user stored in MongoDB.
 *          tags: 
 *            - users
 *          parameters:
 *            - in: cookie
 *              name: token
 *              required: true
 *              schema:
 *                type: string
 *            - in: body
 *              name: password
 *              description: New password
 *              required: true
 *              example: N3w_P@ssw0rd_123!
 *              schema:
 *                type: string
 *          requestBody:
 *            required: true
 *            content:
 *              application/json:
 *                schema: 
 *                  type: object
 *                  properties:
 *                    password:
 *                      type: string
 *                      description: New password.
 *                      example: N3w_P@ssw0rd_123!
 *          responses:
 *            "200":
 *              description: Password modified.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: Password changed successfully.
 *            "400":
 *              description: Password modification failed.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: Password change failed.
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
 *                        example: Password change failed.
 */
router.patch('/changepassword', // URI Pattern
    users_limiter, // Rate-limiting 
    AuthenticatorMiddleware.checkToken, // Checks for presence of and verifies JWT token 
    csurf({ cookie : { httpOnly : true, sameSite : 'strict' }, ignoreMethods : ['HEAD', 'OPTIONS']}), // CSRF Protection
    ValidatorMiddleware.userChangePasswordValidator(), // Request body validation/sanitisation
    ValidatorMiddleware.validatorReporter, 
    Users.changeUserPassword // Controller method
);

/**
 *  @swagger
 *  paths:
 *    /api/users/delete:
 *      delete:
 *          summary: Delete account.
 *          description: Deletes an existing user stored in MongoDB.
 *          tags: 
 *            - users
 *          parameters:
 *            - in: cookie
 *              name: token
 *              required: true
 *              schema:
 *                type: string
 *          responses:
 *            "200":
 *              description: Account deleted.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: Account deleted successfully.
 *            "400":
 *              description: Account deletion failed.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: Account deletion failed.
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
 *                        example: Account deletion failed.
 */
router.delete('/delete', // URI Pattern
    users_limiter, // Rate-limiting
    AuthenticatorMiddleware.checkToken, // Checks for presence of and verifies JWT token 
    csurf({ cookie : { httpOnly : true, sameSite : 'strict' }, ignoreMethods : ['HEAD', 'OPTIONS']}), // CSRF Protection
    Users.deleteUser // Controller method
);

module.exports = router;