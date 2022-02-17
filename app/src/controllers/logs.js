/**
 * logs.js
 * 
 * Provides a class of controller-based methods for recent activity functionality.
 * 
 * @author Ryan Instrell
 * @package cyban
 */

// HTTP Status Codes module.
const { StatusCodes } = require('http-status-codes'),
	// 'logplease' Logger.
	logger = require('logplease').create('server'),
	// 'Entries' MongoDB Schema.
	logs = require('../models/logs');

module.exports = class Logs {

	/**
	 * 
	 * Retrieves all logs from the model.
	 * 
	 * @async
	 * @param {*} req 
	 * @param {*} res 
	 * @param {*} next 
	 */
	static async getLogs (req, res, next) {
		try {
			// Retrieve generated logs from the 'Logs' schema;
			// Applying pagination-based methods .skip() and .limit() functions provided by Mongoose.
			const page_num = req.query.page_num ?? 1,
				per_page = 5,
				offset = (page_num - 1) * per_page,
				logs_count = await logs.countDocuments({}),
				logs_list = await logs
				.find({})
				.sort({ 'createdAt': -1 })
				.skip(offset)
				.limit(per_page);

			if (!logs_list) return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ 'msg' : 'Logs could not be retrieved.' });
			
			return res
			.status(StatusCodes.OK)
			.json({ logs_list, logs_count });

		} catch (err) {
			logger.error(`${err.message}`);

			return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ 'msg' : 'Logs could not be retrieved.' });
		}
	}
}