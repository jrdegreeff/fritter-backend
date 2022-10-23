import type {Request, Response} from 'express';
import express from 'express';
import FollowCollection from './collection';
import * as userValidator from '../user/middleware';
import * as followValidator from '../follow/middleware';
import * as util from './util';

const router = express.Router();

/**
 * Get followers and following of a user.
 * 
 * @name GET /api/follows?username=username
 * 
 * @return {FollowResponse}
 * 
 * @throws {400} if username is not given
 * @throws {404} if username is not a recognized username of any user
 */
router.get(
    '/',
    userValidator.isQueryUsernameExists,
    async (req: Request, res: Response) => {
        const follow = await FollowCollection.findOne(req.query.username as string);
        const response = util.constructFollowResponse(follow);
        res.status(200).json(response);
    }
);

/**
 * Follow a user.
 * 
 * @name POST /api/follows
 * 
 * @param {string} username
 * @return {string} a success message
 * 
 * @throws {401} if the user is not logged in
 * @throws {400} if username is not given
 * @throws {404} if username is not a recognized username of any user
 * @throws {400} if username is the logged in user
 * @throws {409} if the user already follows username
 */
router.post(
    '/',
    userValidator.isUserLoggedIn,
    userValidator.isBodyUsernameExists,
    userValidator.isUsernameNotSelf,
    followValidator.isNotFollower,
    async (req: Request, res: Response) => {
        await FollowCollection.insertFollowByUsername(req.session.userId, req.body.username);
        res.status(201).json({
            message: `Followed ${req.body.username} successfully.`
        });
    }
);

/**
 * Unfollow a user.
 * 
 * @name DELETE /api/follows/:username
 * 
 * @return {string} a success message
 * 
 * @throws {401} if the user is not logged in
 * @throws {400} if username is not given
 * @throws {404} if username is not the username of a followed user
 */
router.delete(
    '/:username',
    userValidator.isUserLoggedIn,
    userValidator.isParamsUsernameExists,
    followValidator.isFollower,
    async (req: Request, res: Response) => {
        await FollowCollection.removeFollowByUsername(req.session.userId, req.params.username);
        res.status(200).json({
            message: `Unfollowed ${req.params.username} successfully.`
        });
    }
);

export {router as followRouter};
