import type {Request, Response, NextFunction} from 'express';
import FollowCollection from '../follow/collection';

/**
 * Checks if the user follows req.params.username
 */
const isFollower = async (req: Request, res: Response, next: NextFunction) => {
    if (!await FollowCollection.isFollower(req.session.userId, req.params.username)) {
        res.status(404).json({
            error: `You are not currently following ${req.params.username}`
        });
        return;
    }
    next();
};

/**
 * Checks if the user follows req.body.username
 */
 const isNotFollower = async (req: Request, res: Response, next: NextFunction) => {
    if (await FollowCollection.isFollower(req.session.userId, req.body.username)) {
        res.status(409).json({
            error: `You are already following ${req.body.username}`
        });
        return;
    }
    next();
};

export {
    isFollower,
    isNotFollower
};
