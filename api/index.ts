// This file must be in the /api folder for Vercel to detect it as a serverless function
import type {Request, Response} from 'express';
import express from 'express';
import {engine} from 'express-handlebars';
import session from 'express-session';
import path from 'path';
import logger from 'morgan';
import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import * as userValidator from '../user/middleware';
import {userRouter} from '../user/router';
import {freetRouter} from '../freet/router';

// Load environmental variables
dotenv.config({});

// Connect to mongoDB
const mongoConnectionUrl = process.env.MONGO_SRV;
if (!mongoConnectionUrl) {
  throw new Error('Please add the MongoDB connection SRV as \'MONGO_SRV\'');
}

mongoose
  .connect(mongoConnectionUrl)
  .then(m => {
    console.log('Connected to MongoDB');
    const db = m.connection;
  })
  .catch(err => {
    console.error(`Error connecting to MongoDB: ${err.message as string}`);
  });

mongoose.connection.on('error', err => {
  console.error(err);
});

// Initalize an express app
const app = express();

// Declare the root directory
app.use(express.static(path.join(__dirname, '../public')));

// View engine setup
app.engine('html', engine({extname: '.html', defaultLayout: false}));
app.set('view engine', 'html');
app.set('views', path.join(__dirname, '../public'));

// Set the port
app.set('port', process.env.PORT || 3000);

// Log requests in the terminal
app.use(logger('dev'));

// Parse incoming requests with JSON payloads ('content-type: application/json' in header)
app.use(express.json());

// Parse incoming requests with urlencoded payloads ('content-type: application/x-www-form-urlencoded' in header)
app.use(express.urlencoded({extended: false}));

// Initialize cookie session
app.use(session({
  secret: '61040',
  resave: true,
  saveUninitialized: false
}));

// This makes sure that if a user is logged in, they still exist in the database
app.use(userValidator.isCurrentSessionUserExists);

// GET home page
app.get('/', (req: Request, res: Response) => {
  res.render('index');
});

// Add routers from routes folder
app.use('/api/users', userRouter);
app.use('/api/freets', freetRouter);

// Catch all the other routes and display error message
app.all('*', (req: Request, res: Response) => {
  res.status(400).render('error');
});

// Create server to listen to request at specified port
const server = http.createServer(app);
server.listen(app.get('port'), () => {
  console.log(`Express server running at http://localhost:${app.get('port') as number}`);
});
