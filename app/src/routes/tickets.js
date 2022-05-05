/**
 * tickets.js
 * 
 * Provides all endpoints for RSS-based operations.
 * 
 * @author Ryan Instrell
 * @package cyban
 */

/** @type { Tickets } */
const Tickets = require('../controllers/tickets'),
    /** @type { ValidatorMiddleware } */
    ValidatorMiddleware = require('../middleware/validator'),
    /** @type { AuthenticatorMiddleware } */
    AuthenticatorMiddleware = require('../middleware/authenticator'),
    // Rate Limiting.
    rateLimit = require('express-rate-limit'),
    tickets_limiter = rateLimit({
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
 *   name: tickets
 *   description: API Methods for Tickets.
 */

/**
 *  @swagger
 *  paths:
 *    /api/tickets:
 *      get:
 *          summary: Retrieves tickets.
 *          description: Returns all tickets stored in MongoDB.
 *          tags: 
 *            - tickets
 *          parameters:
 *            - in: cookie
 *              name: token
 *              required: false
 *              schema:
 *                type: string
 *            - in: query
 *              name: page_num
 *              description: Page number of tickets display.  
 *              required: true
 *              schema:
 *                type: string
 *          responses:
 *            "200":
 *              description: Tickets retrieved.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    items:
 *                      tickets_list:
 *                        type: array
 *                        items: 
 *                          type: object
 *                      tickets_status_count:
 *                        schema:
 *                          type: object
 *                      tickets_count: 
 *                        type: integer
 *            "400":
 *              description: Ticket retrieval failed.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: Tickets could not be retrieved.
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
 *                        example: Tickets could not be retrieved.
 */
router.get('/', // URI Pattern
    tickets_limiter, // Rate-limiting
    ValidatorMiddleware.pageNumberValidator(), // Request body validation/sanitisation
    ValidatorMiddleware.validatorReporter, 
    Tickets.getTickets // Controller method
);

/**
 *  @swagger
 *  paths:
 *    /api/tickets:
 *      post:
 *          summary: Create a ticket.
 *          description: Creates a new ticket document in MongoDB.
 *          tags: 
 *            - tickets
 *          parameters:
 *            - in: body
 *              name: ticket_title
 *              description: Ticket Title
 *              required: true
 *              example: Test Ticket Title
 *              schema:
 *                type: string
 *            - in: body
 *              name: ticket_priority
 *              description: Ticket Priority
 *              required: true
 *              example: low
 *              schema:
 *                type: string
 *                enum:
 *                  - low
 *                  - medium
 *                  - high
 *          requestBody:
 *            required: true
 *            content:
 *              application/json:
 *                schema: 
 *                  type: object
 *                  properties:
 *                    ticket_title:
 *                      type: string
 *                      description: Ticket Title
 *                      example: Test Ticket Title
 *                    ticket_priority:
 *                      type: string
 *                      description: Ticket Priority
 *                      example: low
 *          responses:
 *            "201":
 *              description: Ticket created.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: Ticket created! Your ID is #<id>. 
 *            "400":
 *              description: Ticket creation failed.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: Ticket could not be created.
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
 *                        example: Ticket could not be created.
 */
router.post('/', // URI Pattern
    tickets_limiter, // Rate-limiting
    ValidatorMiddleware.createTicketValidator(), // Request body validation/sanitisation
    ValidatorMiddleware.validatorReporter, 
    Tickets.createTicket // Controller method
);

/**
 *  @swagger
 *  paths:
 *    /api/tickets/{id}:
 *      patch:
 *          summary: Modify a ticket.
 *          description: Modifies an existing ticket stored in MongoDB.
 *          tags: 
 *            - tickets
 *          parameters:
 *            - in: cookie
 *              name: token
 *              required: true
 *              schema:
 *                type: string
 *            - in: path
 *              name: id
 *              description: Ticket ID.
 *              required: true
 *              schema:
 *                type: string
 *            - in: body
 *              name: ticket_status
 *              description: Ticket Status
 *              required: true
 *              example: open
 *              schema:
 *                type: string
 *                enum:
 *                  - new
 *                  - open
 *                  - rejected
 *                  - resolved
 *          requestBody:
 *            required: true
 *            content:
 *              application/json:
 *                schema: 
 *                  type: object
 *                  properties:
 *                    ticket_status:
 *                      type: string
 *                      description: Ticket Status
 *                      example: open
 *          responses:
 *            "200":
 *              description: Ticket modified.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: Ticket could not be updated.
 *            "400":
 *              description: Ticket modification failed.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: Ticket could not be updated.
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
 *                        example: Ticket could not be updated.
 */
router.patch('/:id', // URI Pattern
    tickets_limiter, // Rate-limiting
    AuthenticatorMiddleware.checkToken, // Checks for presence of and verifies JWT token 
    csurf({ cookie : { httpOnly : true, sameSite : 'strict' }, ignoreMethods : ['HEAD', 'OPTIONS']}), // CSRF Protection
    ValidatorMiddleware.editTicketValidator(), // Request body validation/sanitisation
    ValidatorMiddleware.validatorReporter, 
    Tickets.updateTicket // Controller method
);

/**
 *  @swagger
 *  paths:
 *    /api/tickets/{id}:
 *      delete:
 *          summary: Delete a ticket.
 *          description: Deletes an existing ticket stored in MongoDB.
 *          tags: 
 *            - tickets
 *          parameters:
 *            - in: cookie
 *              name: token
 *              required: true
 *              schema:
 *                type: string
 *            - in: path
 *              name: id
 *              description: Ticket ID.
 *              required: true
 *              schema:
 *                type: string
 *          responses:
 *            "200":
 *              description: Ticket deleted.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: Ticket could not be deleted.
 *            "400":
 *              description: Ticket deletion failed.
 *              content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                      msg:
 *                        type: String
 *                        description: Status message.
 *                        example: Ticket could not be deleted.
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
 *                        example: Ticket could not be deleted.
 */
router.delete('/:id', // Controller method
    tickets_limiter, // Rate-limiting
    AuthenticatorMiddleware.checkToken, // Checks for presence of and verifies JWT token 
    csurf({ cookie : { httpOnly : true, sameSite : 'strict' }, ignoreMethods : ['HEAD', 'OPTIONS']}), // CSRF Protection
    ValidatorMiddleware.deleteTicketValidator(), // Request body validation/sanitisation
    ValidatorMiddleware.validatorReporter,
    Tickets.deleteTicket// Controller method
);

module.exports = router;