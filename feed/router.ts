import type {Request, Response} from 'express';
import express from 'express';
import FeedCollection from './collection';
import UserCollection from '../user/collection';
import FollowCollection from '../follow/collection';
import * as userValidator from '../user/middleware';
import * as feedValidator from '../feed/middleware';
import * as util from './util';

const router = express.Router();

/**
 * Get sources and posts of a feed.
 * 
 * @name GET /api/feeds/:name
 * 
 * @return {FeedResponse} the sources and posts of the feed
 * 
 * @throws {401} if the user is not logged in
 * @throws {400} if name is not given
 * @throws {404} if name is not a recognized name of any of the user's feeds
 */
router.get(
    '/:name',
    userValidator.isUserLoggedIn,
    feedValidator.isFeedNameExists,
    async (req: Request, res: Response) => {
        const feed = await FeedCollection.findOne(req.session.userId, req.params.name);
        const response = util.constructFeedResponse(feed);
        res.status(200).json(response);
    }
);

/**
 * Create a feed
 * 
 * @name POST /api/feeds/
 * 
 * @param {string} name
 * @return {string} a success message
 * @return {FeedResponse} the created feed
 * 
 * @throws {401} if the user is not logged in
 * @throws {400} if name is empty or a stream of empty spaces
 * @throws {409} if the user already has a feed with name name
 */
router.post(
    '/',
    userValidator.isUserLoggedIn,
    feedValidator.isValidFeedName,
    feedValidator.isFeedNameNotExists,
    async (req: Request, res: Response) => {
        const feed = await FeedCollection.addOne(req.session.userId, req.body.name);
        const response = util.constructFeedResponse(feed);
        res.status(201).json({
            message: `Feed ${req.body.name} created successfully.`,
            feed: response
        });
    }
);

/**
 * Add and/or removes sources of a feed.
 * 
 * @name PATCH /api/feeds/:name
 * 
 * @param {Array<string>} add the sources to add (optional)
 * @param {Array<string>} remove the sources to remove (optional)
 * @return {string} a success message
 * @return {FeedResponse} the patched feed
 * 
 * @throws {401} if the user is not logged in
 * @throws {400} if name is not given
 * @throws {404} if name is not a recognized name of any of the user's feeds
 * @throws {400} if both add and remove are empty
 * @throws {400} if either add or remove is present and isn't an array
 * @throws {404} if a source in add or remove is not the username of any user
 * @throws {409} if a source in add is already a source of the feed
 * @throws {404} if a source in remove is not a source of the feed
 */
router.patch(
    '/:name',
    userValidator.isUserLoggedIn,
    feedValidator.isFeedNameExists,
    feedValidator.isValidFeedPatch,
    async (req: Request, res: Response) => {
        const add = (req.body.add && JSON.parse(req.body.add) as Array<string>) || [];
        const remove = (req.body.remove && JSON.parse(req.body.remove) as Array<string>) || [];
        for (const source of add) {
            await FeedCollection.addSource(req.session.userId, req.params.name, source);
            if (req.params.name === "Following") {
                const sourceId = (await UserCollection.findOneByUsername(source))._id;
                await FollowCollection.insertFollow(req.session.userId, sourceId);
            }
        }
        for (const source of remove) {
            await FeedCollection.removeSource(req.session.userId, req.params.name, source);
            if (req.params.name === "Following") {
                const sourceId = (await UserCollection.findOneByUsername(source))._id;
                await FollowCollection.removeFollow(req.session.userId, sourceId);
            }
        }
        const feed = await FeedCollection.findOne(req.session.userId, req.params.name);
        const response = util.constructFeedResponse(feed);
        res.status(200).json({
            message: `Feed ${req.params.name} updated successfully.`,
            feed: response
        });
    }
);

/**
 * Delete a feed.
 * 
 * @name DELETE /api/feeds/:name
 * 
 * @return {string} a success message
 * 
 * @throws {401} if the user is not logged in
 * @throws {400} if name is not given
 * @throws {404} if name is not a recognized name of any of the user's feeds
 * @throws {400} if the user tries to delete the "Following" feed
 */
router.delete(
    '/:name',
    userValidator.isUserLoggedIn,
    feedValidator.isFeedNameExists,
    feedValidator.isNameNotFollowing,
    async (req: Request, res: Response) => {
        await FeedCollection.deleteOne(req.session.userId, req.params.name);
        res.status(200).json({
            message: `Feed ${req.params.name} deleted successfully.`
        })
    }
);

export {router as feedRouter};
