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
	// 'Logs' MongoDB Schema.
	logs = require('../models/logs'),
	// 'Users' MongoDB Schema.
	users = require('../models/users');

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
			.status(StatusCodes.BAD_REQUEST)
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

	/**
	 * 
	 * Computes performance on a per-user basis.
	 * 
	 * @async
	 * @param {*} req 
	 * @param {*} res 
	 * @param {*} next 
	 */
	static async getUserPerformance (req, res, next) {
		try {
			const username = req.user.username;
			// Stores total count of created, modified, deleted logs for specific user.
			// Also scores the mean count of created, modified, deleted logs for all users.
			let user_performance = {},
				user_performance_averages = { created : 0, modified : 0, deleted : 0 },
				created_total = 0,
				created_count = 0,
				modified_total = 0,
				modified_count = 0,
				deleted_total = 0,
				deleted_count = 0;

			// For each user in logs, calculate a count of entries created, modified, deleted.
			await logs
			.find({}).cursor().eachAsync(async logs => {
				if (!(logs.user in user_performance))
				user_performance[logs.user] = { created : 0, modified : 0, deleted : 0 };

				switch (logs.action) {
					case 'created': 
						user_performance[logs.user].created++;
						break;
					case 'modified': 
						user_performance[logs.user].modified++;
						break;
					case 'deleted': 
						user_performance[logs.user].deleted++;
						break;
					default:
						break;
				}
			});

			// If a registered user is not in the logs schema (i.e. Has not performed the actions);
			// Set count of entries created, modified, deleted to 0. 
			await users
			.find({}).cursor().eachAsync(async users => {
				if (!(users.username in user_performance))
				user_performance[users.username] = { created : 0, modified : 0, deleted : 0 };
			});

			if (!(username in user_performance)) return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ 'msg' : 'Performance overview could not be retrieved.' });

			Object.values(user_performance).map(users => {
				created_total += users.created;
				created_count++;

				modified_total += users.modified;
				modified_count++;

				deleted_total += users.deleted;
				deleted_count++;
			});

			// Calculates average of created, modified, deleted logs for ALL users.
			if (!(created_total === 0 || created_count === 0))
			user_performance_averages.created = Math.trunc(created_total / created_count);

			if (!(modified_total === 0 || modified_count === 0))
			user_performance_averages.modified = Math.trunc(modified_total / modified_count);

			if (!(deleted_total === 0 || deleted_count === 0))
			user_performance_averages.deleted = Math.trunc(deleted_total / deleted_count);

			return res
			.status(200)
			.json({ user_performance : user_performance[username], user_performance_averages});

		} catch (err) {
			logger.error(`${err.message}`);

			return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ 'msg' : 'Performance overview could not be retrieved.' });
		}
	}
}