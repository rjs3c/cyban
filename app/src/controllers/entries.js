/**
 * entries.js
 * 
 * Provides a class of controller-based methods for entry manipulation.
 * 
 * @author Ryan Instrell
 * @package cyban
 */

// HTTP Status Codes module.
const { StatusCodes } = require('http-status-codes'),
	// 'logplease' Logger.
	logger = require('logplease').create('server'),
	// 'Entries' MongoDB Schema.
	entries = require('../models/entries'),
	// 'Logs' MongoDB Schema.
	logs = require('../models/logs');

module.exports = class Entries {

	/**
	 * 
	 * Retrieves all entries from the model.
	 * 
	 * @async
	 * @param {*} req 
	 * @param {*} res 
	 * @param {*} next 
	 */
	static async getEntries (req, res, next) {
		try {
			let entries_list = [],
				filter_query = {};
			
			if (req.query) {
				const { entry_search, entry_category, entry_priority } = req.query;
				
				// Filters - entry_search and entry_category.
				if (entry_search) filter_query.$or = [{ entry_title : new RegExp(entry_search , 'i') }];
				if (entry_category) filter_query.entry_category = entry_category;
				if (entry_priority) filter_query.entry_priority = entry_priority;
			}

			// Applies the filters, also sorts by the creation date.
			entries_list = await entries
			.find(filter_query)
			.sort('createdAt');	

			if (!entries_list) return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ 'msg' : 'Entries could not be retrieved.' });
			
			return res
			.status(StatusCodes.OK)
			.json(entries_list);

		} catch (err) {
			logger.error(`${err.message}`);

			return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ 'msg' : 'Entries could not be retrieved.' });
		}
	}

	/**
	 * 
	 * Creates a specific entry.
	 * 
	 * @async
	 * @param {*} req 
	 * @param {*} res 
	 * @param {*} next 
	 */
	 static async createEntry (req, res, next) {
		try {
			// Creates an entry in the 'Entries' schema.
			const created_entry = await entries.create(req.body);

			if (!created_entry) return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ 'msg' : 'Entry could not be created.' });

			// Generates a log, storing this in the 'Logs' schema.
			await logs.create({
				user : req.user.username,
				action : 'created'
			});

			return res
			.status(StatusCodes.CREATED)
			.json({ 'msg' : 'Entry created successfully.' });

		} catch (err) {
			logger.error(`${err.message}`);			
			
			return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ 'msg' : 'Entry could not be created.' });
		}
	}

	/**
	 * 
	 * Updates a specific entry.
	 * 
	 * @async
	 * @param {*} req 
	 * @param {*} res 
	 * @param {*} next 
	 */
	static async updateEntry (req, res, next) {
		try {
			// Updates an entry based upon an existing MongoDB ObjectId.
			const { id } = req.params,
				updated_entry = await entries.findOneAndUpdate({ 
					_id : id 
				}, req.body, {
					new : true,
					runValidators : true
				});

			if (!updated_entry) res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ 'msg' : 'Entry could not be updated.' });

			// Generates a log, storing this in the 'Logs' schema.
			await logs.create({
				user : req.user.username,
				action : 'modified'
			});

			return res
			.status(200)
			.json({ 'msg' : 'Entry successfully updated.' });

		} catch (err) {
			logger.error(`${err.message}`);

			return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ 'msg' : 'Entry could not be updated.' });
		}
	}

	/**
	 * 
	 * Removes a specific entry.
	 * 
	 * @async
	 * @param {*} req 
	 * @param {*} res 
	 * @param {*} next 
	 */
	static async deleteEntry (req, res, next) {
		try {
			// Deletes an entry based on the supplied MongoDB ObjectId (provided it is valid).
			const { id } = req.params,
				entry_to_delete = await entries.findOneAndDelete({
					_id : id
				});

			// Deletes its dependencies.
			await entries.deleteMany({ entry_depends_on : id });

			if (!entry_to_delete) return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({'msg' : 'Entry could not be deleted.'});

			// Generates a log, storing this in the 'Logs' schema.
			await logs.create({
				user : req.user.username,
				action : 'deleted'
			});

			return res
			.status(StatusCodes.OK)
			.json({ 'msg' : 'Entry successfully deleted.' });

		} catch (err) {
			logger.error(`${err.message}`);

			return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ 'msg' : 'Entry could not be deleted.' });
		}
	}
}