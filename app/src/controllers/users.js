/**
 * users.js
 * 
 * Provides a class of controller-based methods for user authentication.
 * 
 * @author Ryan Instrell
 * @package cyban
 */

// HTTP Status Codes module.
const { StatusCodes } = require('http-status-codes'),
    // 'logplease' Logger.
    logger = require('logplease').create('server'),
    // 'Users' MongoDB Schema.
    users = require('../models/users');

module.exports = class Users {

    /**
	 * 
	 * Registers a user.
	 * 
	 * @async
	 * @param {*} req 
	 * @param {*} res 
	 * @param {*} next 
	 */
    static async registerUser (req, res, next) {
        try {
            const { username, password } = req.body;

            if (!(username && password)) return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ 'msg' : 'Entered information is not valid.' });

            // Checks if a user exists;
            // Uses .lean() method from Mongoose, returning a JS Object for increased performance (as getters + setters not necessary).
            const user_exists = await users.findOne({ username }).lean();

            if (user_exists) return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ 'msg' : 'User creation failed.' });

            // Provided the user doesn't already exist, a user in the 'Users' scheme is created.
            const created_user = await users.create({ username, password });

            if (!created_user) return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ 'msg' : 'User creation failed.' });

            return res
			.status(StatusCodes.CREATED)
			.json({ 'msg' : 'User created successfully.' });

        } catch (err) {
            logger.error(`${err.message}`);			
			
			return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ 'msg' : 'User creation failed.' });
        }
    }

    /**
	 * 
	 * Authenticates a user.
	 * 
	 * @async
	 * @param {*} req 
	 * @param {*} res 
	 * @param {*} next 
	 */
     static async loginUser (req, res, next) {
        try {
            const { username, password } = req.body;

            if (!(username && password)) return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ 'msg' : 'Entered information is not valid.' });

            // Checks if the user exists first.
            // Didn't use Mongoose's .lean() method as cannot call custom schema methods otherwise.
            const user_exists = await users.findOne({ username });

            if (!user_exists) return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ 'msg' : 'Authentication failed.' });

            // Using Bcrypt, hash supplied password and compare with the one stored.
            if (!(await user_exists.verifyPassword(password))) return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ 'msg' : 'Authentication failed.' });

            // If verification was successful, generate a JWT;
            const token = user_exists.createToken();

            // Return JWT in response;
            // HTTP-only.
            return res
            .status(StatusCodes.OK)
            .cookie('token', token, {
                httpOnly: true,
                //secure: true,
                sameSite: 'strict'
            })
            .json({ 'msg' : 'Successfully authenticated.', username : username });

        } catch (err) {
            logger.error(`${err.message}`);			
			
			return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ 'msg' : 'Authentication failed.' });
        }
    }

    /**
	 * 
	 * De-authenticates a user.
	 * 
	 * @async
	 * @param {*} req 
	 * @param {*} res 
	 * @param {*} next 
	 */
     static async logoutUser (req, res, next) {
        try {
            // Checks if the token is set (also, passed from the dispatched authentication middleware).
            const token = req.cookies.token;

            if (!token) return res
            .status(StatusCodes.FORBIDDEN)
            .json({ 'msg' : 'Deauthentication failed.' });

            // Sets the token in the past, thereby removing this from the client's local storage.
            return res
            .status(StatusCodes.OK)
            .cookie('token', token, { expires : new Date(0) })
            .json({ 'msg' : 'Successfully logged out.' });
            
        } catch (err) {
            logger.error(`${err.message}`);			
			
			return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ 'msg' : 'Deauthentication failed.' });
        }
    }

    /**
	 * 
	 * Changes a user's password.
	 * 
	 * @async
	 * @param {*} req 
	 * @param {*} res 
	 * @param {*} next 
	 */
    static async changeUserPassword (req, res, next) {
        try {
            const username = req.user.username,
                { password } = req.body;

            if (!(username || password)) return res
            .status(StatusCodes.FORBIDDEN)
            .json({ 'msg' : 'Password change failed.' });

            // Checks if a user exists;
            // Uses .lean() method from Mongoose, returning a JS Object for increased performance (as getters + setters not necessary).
            const user_exists = await users.findOne({ username }).lean();

            if (!user_exists) return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ 'msg' : 'Password change failed.' });

            // Finds the specific user with a username, changing their password.
            const changed_password = await users.findOneAndUpdate({
                username 
            }, req.body, {
                new : true,
                runValidators: true
            });

            if (!changed_password) return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ 'msg' : 'Password change failed.' });

            return res
			.status(StatusCodes.OK)
			.json({ 'msg' : 'Password changed successfully.' });
            
        } catch {
            logger.error(`${err.message}`);			
			
			return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ 'msg' : 'Password change failed.' });
        }
    }

    /**
	 * 
	 * Deletes a registered user.
	 * 
	 * @async
	 * @param {*} req 
	 * @param {*} res 
	 * @param {*} next 
	 */
    static async deleteUser (req, res, next) {
        try {
            const username = req.user.username;

            if (!username) return res
            .status(StatusCodes.FORBIDDEN)
            .json({ 'msg' : 'Account deletion failed.' });

            // Checks if a user exists;
            // Uses .lean() method from Mongoose, returning a JS Object for increased performance (as getters + setters not necessary).
            const user_exists = await users.findOne({ username }).lean();

            if (!user_exists) return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ 'msg' : 'Account deletion failed.' });

            // Deletes the specific document from the 'Users' schema.
            const user_to_delete = await users.findOneAndDelete({ username });

            if (!user_to_delete) return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ 'msg' : 'Account deletion failed.' });

            return res
			.status(StatusCodes.OK)
			.json({ 'msg' : 'Account deleted successfully.' });

        } catch {
            logger.error(`${err.message}`);			
			
			return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ 'msg' : 'Account deletion failed.' });
        }
    }
}