/**
 * routes.js
 * 
 * Wrapper for each specific route. 
 * 
 * @author Ryan Instrell
 * @package cyban
 */

/** @type { Router } */
const entries_router = require('./routes/entries'), 
	users_router = require('./routes/users'),
	auth_router = require('./routes/auth'),
	export_router = require('./routes/export'),
	logs_router = require('./routes/logs'),
	rss_router = require('./routes/rss'),
	tickets_router = require('./routes/tickets');

module.exports =  {
	entries_router,
	users_router,
	auth_router,
	export_router,
	logs_router,
	rss_router,
	tickets_router
};