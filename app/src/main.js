/**
 * main.js
 * 
 * Main entry point for application.
 * 
 * @author Ryan Instrell
 * @package cyban
 */

// Miscellaneous Constants.
/** @type {String} */
const graphic = `                      
               .-==+++=-:               
            .=************=.            
           -*****=---=+*****=           
          =****-        =****+          
         :****-          -****:         
         -****.          .****-         
       -=+****+==========+****+=-       
      -##########################-      
      -###****####****#####****##-      
      -###****####****#####****##-      
      -##########################-      
      -##########################-      
      -##########################-      
      -###****#####***#####***+**-      
      :##################*+++*%%%:      
        =+++++++++-::::. .::::::        
       .********+.                      
      .*******+:                        
      +******-                          
     -======.      
                                                        
    [ CyBan v1.1 ] 
    [ Author: Ryan Instrell ]

`;

/** @type {Number} */
const PORT = process.env.PORT || 3000;

// .env file.
require('dotenv').config({ silent : true });

// Imports.
const express = require('express'),
  favicon = require('serve-favicon'),
  path = require('path');
  logger = require('logplease').create('server'),
  mongoose = require('mongoose'),
  cookieParser = require('cookie-parser'),
  cors = require('cors'),
  xss = require('xss-clean'),
  helmet = require('helmet'),
  mongoSanitize = require('express-mongo-sanitize'),
  crypto = require('crypto'),
  app = express();

// .env JWT_TOKEN.
process.env.JWT_TOKEN = crypto.randomBytes(64).toString('hex');

// Application Configuration.
app.enable('trust proxy');

/** @type {Object} */
const { 
  entries_router,
  auth_router,
  users_router,
  export_router,
  logs_router
} = require('./router'),
  /** @type {Object} */
  { UnsuccessfulMiddleware } = require('./middleware');

// Application Middleware. 
app.use(UnsuccessfulMiddleware.methodNotAcceptable);
app.use(cookieParser());
app.use(favicon(path.join(__dirname,'..', 'public', 'images', 'favicon.ico')));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json({ limit : '10kb' }));
app.use(cors());
app.use(xss());
app.use(helmet());
app.use(mongoSanitize());

// Application Routes.
app.use('/api/entries/', entries_router);
app.use('/api/users/', users_router);
app.use('/api/auth/', auth_router);
app.use('/api/export/', export_router);
app.use('/api/logs/', logs_router);
app.use(UnsuccessfulMiddleware.notFound);

/**
 * Initialises a server to listen and send messages over HTTP.
 * NB. All system messages are produced using 'logplease'.
 */
const initialise_server = async PORT => {
  try {
    console.log(graphic, "[+] Server Logs:\n");

    await connect_db(process.env.MONGO_URI)
    .then(() => {
      logger.info('Successfully connected to MongoDB');
    })
    .catch((err) => {
      logger.error(err);
      process.exit(1);
    });
    
    app.listen(PORT, () => {
      logger.info(`Server is listening on port ${PORT}...`);
    });
    process.on('uncaughtException', err => {
      logger.error(`${err.message}`);
    });
  } catch (err) {
    logger.error(`${err.message}`);
  }
}

// Initiates a connection with the MongoDB Server.
const connect_db = URI => {
  return mongoose.connect(URI, {
    useNewUrlParser : true,
    useUnifiedTopology : true
  });
};

// Application Start.
initialise_server(PORT);

module.exports = app;