/**
 * router.js
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
	logs_router = require('./routes/logs');

module.exports =  {
	entries_router,
	users_router,
	auth_router,
	export_router,
	logs_router
};