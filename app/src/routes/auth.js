/**
 * auth.js
 * 
 * Provides all endpoints for authentication-based operations.
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
    auth_limiter = rateLimit({
        windowMs: 60 * 1000,
        max: 12,
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
 *   name: auth
 *   description: API Methods for Authentication.
 */

/**
 *  @swagger
 *  paths:
 *    /api/auth:
 *      get:
 *          summary: Returns a status of whether a user is authenticated.
 *          description: Returns a specific status depending on whether a user is authenticated.
 *          tags: 
 *            - auth
 *          parameters:
 *            - in: cookie
 *              name: token
 *              required: false
 *              type: string
 *          responses:
 *            "404":
 *              description: The user is authenticated.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: Not found.   
 *            "403":
 *              description: The user is unauthenticated.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: Not authenticated.
 */
router.get('/', // URI Pattern
    AuthenticatorMiddleware.checkToken // Checks for presence of and verifies JWT token
);

/**
 *  @swagger
 *  paths:
 *    /api/auth/login:
 *      post:
 *          summary: Authenticates a user.
 *          description: Responsible for authenticating a user using their supplied credentials.
 *          tags: 
 *            - auth
 *          parameters:
 *            - in: body
 *              name: username
 *              description: Username
 *              required: true
 *              example: my_username
 *              type: string
 *            - in: body
 *              name: password
 *              description: Password
 *              required: true
 *              example: P@ssw0rd_123!
 *              type: string
 *          requestBody:
 *            required: true
 *            content:
 *              application/json:
 *                schema: 
 *                  type: object
 *                  properties:
 *                    username:
 *                      type: string
 *                      description: Username.
 *                      example: my_username
 *                    password:
 *                      type: string
 *                      description: Password.
 *                      example: P@ssw0rd_123!
 *          responses:
 *            "200":
 *              description: Successfully authenticated.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: Welcome, <username>!     
 *            "400":
 *              description: Authentication failed.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: Authentication failed.
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
 *                        example: Authentication failed.
 */
router.post('/login', // URI Pattern 
    auth_limiter, // Rate-limiting
    ValidatorMiddleware.userValidator(), // Request body validation/sanitisation
    ValidatorMiddleware.validatorReporter, 
    Users.loginUser // Controller method
);

/**
 *  @swagger
 *  paths:
 *    /api/auth/register:
 *      post:
 *          summary: Registers users.
 *          description: Creates a user, and if successful, notifies of this accordingly.
 *          tags: 
 *            - auth
 *          parameters:
 *            - in: body
 *              name: username
 *              description: Username
 *              required: true
 *              example: my_username
 *              type: string
 *            - in: body
 *              name: password
 *              description: Password
 *              required: true
 *              example: P@ssw0rd_123!
 *              type: string
 *          requestBody:
 *            required: true
 *            content:
 *              application/json:
 *                schema: 
 *                  type: object
 *                  properties:
 *                    username:
 *                      type: string
 *                      description: Username.
 *                      example: my_username
 *                    password:
 *                      type: string
 *                      description: Password.
 *                      example: P@ssw0rd_123!
            responses:
 *            "201":
 *              description: User created successfully.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: User created successfully.     
 *            "400":
 *              description: User creation failed..
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: User creation failed.
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
 *                        example: User creation failed.
 */
router.post('/register', // URI Pattern 
    auth_limiter, // Rate-limiting
    ValidatorMiddleware.userValidator(), // Request body validation/sanitisation
    ValidatorMiddleware.validatorReporter, 
    Users.registerUser // Controller method
);

/**
 *  @swagger
 *  paths:
 *    /api/auth/logout:
 *      get:
 *          summary: Logs a user out.
 *          description: Clears the JWT from local storage and notifies if this is successful.
 *          tags: 
 *            - auth
 *          parameters:
 *            - in: cookie
 *              name: token
 *              required: true
 *              type: string
 *          responses:
 *            "200":
 *              description: Successfully logged out.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: Goodbye, <username>.   
 *            "400":
 *              description: Logging out of user failed.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: Deauthentication failed.
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
 *                        example: Deauthentication failed.
 *          
 */
router.get('/logout', // URI Pattern
    auth_limiter, // Rate-limiting
    AuthenticatorMiddleware.checkToken, // Checks for presence of and verifies JWT token 
    csurf({ cookie : { httpOnly : true, sameSite : 'strict' }, ignoreMethods : ['HEAD', 'OPTIONS']}), // CSRF Protection
    Users.logoutUser // Controller method
);

module.exports = router;