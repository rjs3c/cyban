/**
 * rss.js
 * 
 * Provides a class of controller-based methods for RSS functionality.
 * 
 * @author Ryan Instrell
 * @package cyban
 */

// HTTP Status Codes module.
const { StatusCodes } = require('http-status-codes'),
	// 'logplease' Logger.
	logger = require('logplease').create('server'),
	// 'RSS' MongoDB Schema.
	rss = require('../models/rss'),
	// 'RSSParser' module.
	RSSParser = require('rss-parser'),
    rss_parser = new RSSParser({ headers : { Accept : 'application/rss+xml, application/xml' } });

module.exports = class RSS {

	/**
	 * 
	 * Retrieves RSS feed.
	 * 
	 * @async
	 * @param {*} req 
	 * @param {*} res 
	 * @param {*} next 
	 */
	static async getRSS (req, res, next) {
		try {
			const username = req.user.username,
				// Search expression from the search box.
				rss_search = req.query.rss_search ?? '',
				// If a preferred RSS source is not set;
				// Defaults to TheHackerNews.
                default_rss_source = 'https://feeds.feedburner.com/TheHackersNews?format=xml';
			
			let rss_source = '',
				rss_title = '';

            if (!username) return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ 'msg' : 'RSS feed could not be retrieved.' });

			// Checks in the 'RSS' schema to see if a user changed their default RSS source.
            const rss_retrieved = await rss
            .find({ user : username }).select('pref_rss_source').lean();

			// If the preferred RSS source is set, this will be used;
			// Otherwise, the default RSS source is used.
            if (rss_retrieved.length === 0) rss_source = default_rss_source
            else rss_source = rss_retrieved[0].pref_rss_source

			// Turns the RSS feed (represented as XML) into an object.
            let rss_feed = await rss_parser.parseURL(rss_source);

			rss_title = rss_feed.title ?? 'Source N/A';

			// Filters the above object based upon a search expression (if set).
			if (rss_search.length !== 0)
			rss_feed = { items : rss_feed.items.filter(feed => new RegExp(rss_search, 'i').test(feed.title)) };
				
            if (!rss_feed) return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ 'msg' : 'RSS feed could not be retrieved.' });

            return res
			.status(StatusCodes.OK)
			.json({ rss_feed, rss_title });

		} catch (err) {
			logger.error(`${err.message}`);

			return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ 'msg' : 'RSS feed could not be retrieved.' });
		}
	}

    /**
	 * 
	 * Changes RSS source for a user.
	 * 
	 * @async
	 * @param {*} req 
	 * @param {*} res 
	 * @param {*} next 
	 */
    static async changeRSS (req, res, next) {
        try {
			const username = req.user.username,
                { pref_rss_source } = req.body;

            let rss_change_result = undefined;

            if (!(username || pref_rss_source)) return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ 'msg' : 'RSS feed source could not be changed.' });

			// Turns the RSS feed (represented as XML) into an object.
            await rss_parser.parseURL(pref_rss_source)
			.then(async () => {
				// First checks if the user exists in the 'RSS' schema. 
				const user_exists = await rss
				.findOne({ user : username }).lean();
	
				// If the user doesn't exist in the 'RSS' schema;
				// Creates a document with their preferred RSS source.
				// Otherwise, updates the existing document.
				if (!user_exists) 
				rss_change_result = await rss.create({ user : username, pref_rss_source });
				else
				rss_change_result = await rss.findOneAndUpdate({
					user : username
				}, req.body, {
					new : true,
					runValidators: true
				});
	
				if (!rss_change_result) return res
				.status(StatusCodes.FORBIDDEN)
				.json({ 'msg' : 'RSS feed source could not be changed.' });
	
				return res
				.status(StatusCodes.OK)
				.json({ 'msg' : 'RSS feed source changed successfully.' });
			})
			.catch(() => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 'msg' : 'RSS feed source could not be changed.' }));

		} catch (err) {
			logger.error(`${err.message}`);

			return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ 'msg' : 'RSS feed source could not be changed.' });
		}
    }
}