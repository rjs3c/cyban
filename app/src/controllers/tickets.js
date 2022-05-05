/**
 * tickets.js
 * 
 * Provides a class of controller-based methods for ticket manipulation.
 * 
 * @author Ryan Instrell
 * @package cyban
 */

// HTTP Status Codes module.
const { StatusCodes } = require('http-status-codes'),
	// 'logplease' Logger.
	logger = require('logplease').create('server'),
	// 'Logs' MongoDB Schema.
	tickets = require('../models/tickets');

module.exports = class Tickets {

	/**
	 * 
	 * Retrieves all tickets from the model.
	 * 
	 * @async
	 * @param {*} req 
	 * @param {*} res 
	 * @param {*} next 
	 */
	static async getTickets (req, res, next) {
		try {
			// Page numbers and offsets;
			// For pagination.
			const page_num = req.query.page_num ?? 1,
				per_page = 5,
				offset = (page_num - 1) * per_page,
				tickets_count = await tickets.countDocuments({}),
				// Paginates using the Mongoose methods .skip() and .limit().
				tickets_list = await tickets
				.find({})
				.sort({ 'createdAt': -1 })
				.skip(offset)
				.limit(per_page);

            if (!tickets_list) return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ 'msg' : 'Tickets could not be retrieved.' });
			
			// Calculates a count of tickets of status 'New', 'Open', 'Resolved'.
			let tickets_status_count = { new : 0, rejected : 0, open : 0, resolved : 0 };

            await tickets
			.find({}).cursor().eachAsync(async ticket => {
				switch (ticket.ticket_status) {
					case 'new': 
                    	tickets_status_count.new++;
						break;
					case 'rejected':
						tickets_status_count.rejected++;
						break;
					case 'open': 
                        tickets_status_count.open++;
                        break;
					case 'resolved': 
                        tickets_status_count.resolved++;
                        break;
					default:
						break;
				}
			});
            
            return res
			.status(StatusCodes.OK)
			.json({ tickets_list, tickets_status_count, tickets_count });

		} catch (err) {
			logger.error(`${err.message}`);

			return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ 'msg' : 'Tickets could not be retrieved.' });
		}
	}

    /**
	 * 
	 * Creates a ticket.
	 * 
	 * @async
	 * @param {*} req 
	 * @param {*} res 
	 * @param {*} next 
	 */
    static async createTicket (req, res, next) {
        try {
			// Creates a ticket using the validated POST body.
			const created_ticket = await tickets.create(req.body);

			if (!created_ticket) return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ 'msg' : 'Ticket could not be created.' });

			return res
			.status(StatusCodes.CREATED)
			.json({ 'msg' : `Ticket created! Your ID is #${created_ticket._id.toString().substring(created_ticket._id.toString().length - 4, created_ticket._id.toString().length)}.` });

        } catch (err) {
            logger.error(`${err.message}`);

			return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ 'msg' : 'Ticket could not be created.' });
        }
    }

    /**
	 * 
	 * Updates a ticket.
	 * 
	 * @async
	 * @param {*} req 
	 * @param {*} res 
	 * @param {*} next 
	 */
     static async updateTicket (req, res, next) {
		try {
			// Updates an entry based upon an existing MongoDB ObjectId.
			const { id } = req.params,
				updated_ticket = await tickets.findOneAndUpdate({ 
					_id : id 
				}, req.body, {
					new : true,
					runValidators : true
				});

			if (!updated_ticket) res
			.status(StatusCodes.BAD_REQUEST)
			.json({ 'msg' : 'Ticket could not be updated.' });

			return res
			.status(StatusCodes.OK)
			.json({ 'msg' : 'Ticket successfully updated.' });

		} catch (err) {
			logger.error(`${err.message}`);

			return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ 'msg' : 'Ticket could not be updated.' });
		}
    }

	/**
	 * 
	 * Deletes a ticket.
	 * 
	 * @async
	 * @param {*} req 
	 * @param {*} res 
	 * @param {*} next 
	 */
     static async deleteTicket (req, res, next) {
		try {
			// Deletes an entry based upon an existing MongoDB ObjectId.
			const { id } = req.params,
				deleted_ticket = await tickets.findOneAndDelete({ 
					_id : id 
				});

			if (!deleted_ticket) res
			.status(StatusCodes.BAD_REQUEST)
			.json({ 'msg' : 'Ticket could not be deleted.' });

			return res
			.status(StatusCodes.OK)
			.json({ 'msg' : 'Ticket successfully deleted.' });

		} catch (err) {
			logger.error(`${err.message}`);

			return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ 'msg' : 'Ticket could not be deleted.' });
		}
    }
}