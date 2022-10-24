import type {Request, Response} from 'express';
import express from 'express';
import ThreadCollection from './collection';
import * as freetValidator from '../freet/middleware';
import * as util from './util';

const router = express.Router();

/**
 * The the thread of a freet.
 * 
 * @name GET /api/threads?freetId=freetId
 * 
 * @return {ThreadResponse} the details of the requested thread
 * 
 * @throws {400} if freetId is not given
 * @throws {404} if freetId is invalid
 */
 router.get(
    '/',
    freetValidator.isQueryFreetExists,
    async (req: Request, res: Response) => {
        const freet = await ThreadCollection.findOne(req.query.freetId as string);
        const response = util.constructThreadResponse(freet);
        res.status(200).json(response);
    }
);

export {router as threadRouter};
