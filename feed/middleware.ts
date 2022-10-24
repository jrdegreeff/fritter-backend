import type {Request, Response, NextFunction} from 'express';
import FeedCollection from '../feed/collection';
import UserCollection from '../user/collection';

/**
 *  Checks if user with id req.session.userId has a feed with name req.params.name
 */
const isFeedNameExists = async (req: Request, res: Response, next: NextFunction) => {
    const feed = await FeedCollection.findOne(req.session.userId, req.params.name);
    if (!feed) {
        res.status(404).json({
            error: `Feed with name ${req.params.name} not found`
        });
        return;
    }

    next();
}

/**
 *  Checks if user with id req.session.userId doesn't have a feed with name req.body.name
 */
const isFeedNameNotExists = async (req: Request, res: Response, next: NextFunction) => {
    const feed = await FeedCollection.findOne(req.session.userId, req.body.name);
    if (feed) {
        res.status(409).json({
            error: `Feed with name ${req.body.name} already exists`
        });
        return;
    }

    next();
}

/**
 *  Checks if req.body.name is non-empty
 */
const isValidFeedName = (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.name?.trim()) {
        res.status(400).json({
            error: 'Feed name must be non-empty'
        });
        return;
    }

    next();
}

/**
 *  Checks if req.body.add and req.body.remove are not both empty and each element is valid
 */
const isValidFeedPatch = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.add && !req.body.remove) {
        res.status(400).json({
            error: 'add or remove must be non-empty'
        });
        return;
    }

    if (req.body.add && !Array.isArray(JSON.parse(req.body.add))) {
        res.status(400).json({
            error: 'add must be an array'
        });
        return;
    }

    if (req.body.remove && !Array.isArray(JSON.parse(req.body.remove))) {
        res.status(400).json({
            error: 'remove must be an array'
        });
        return;
    }

    const add = (req.body.add && JSON.parse(req.body.add) as Array<string>) || [];
    for (const source of add) {
        if (await UserCollection.findOneByUsername(source) === null) {
            res.status(404).json({
                error: `${source} in add is not a the username of any user`
            });
            return;
        }
        if (await FeedCollection.hasSource(req.session.userId, req.params.name, source)) {
            res.status(409).json({
                error: `${source} in add is already a source of feed ${req.params.name}`
            });
            return;
        }
    }

    const remove = (req.body.remove && JSON.parse(req.body.remove) as Array<string>) || [];
    for (const source of remove) {
        if (await UserCollection.findOneByUsername(source) === null) {
            res.status(404).json({
                error: `${source} in remove is not a the username of any user`
            });
            return;
        }
        if (!await FeedCollection.hasSource(req.session.userId, req.params.name, source)) {
            res.status(404).json({
                error: `${source} in remove is not a source of feed ${req.params.name}`
            });
            return;
        }
    }

    next();
}

/**
 *  Checks if req.params.name is not the reserved feed "Following"
 */
const isNameNotFollowing = (req: Request, res: Response, next: NextFunction) => {
    if (req.params.name === "Following") {
        res.status(400).json({
            error: 'Cannot delete the Following feed'
        });
        return;
    }

    next();
}

export {
    isFeedNameExists,
    isFeedNameNotExists,
    isValidFeedName,
    isValidFeedPatch,
    isNameNotFollowing
};
