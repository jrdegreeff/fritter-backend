import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import FreetCollection from '../freet/collection';


const isFreetExists = async (freetId: string, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(freetId);
  const freet = validFormat ? await FreetCollection.findOne(freetId) : '';
  if (!freet) {
    res.status(404).json({
      error: {
        freetNotFound: `Freet with freet ID ${freetId} does not exist.`
      }
    });
    return;
  }

  next();
};

/**
 * Checks if a freet with freetId is req.params exists
 */
const isParamsFreetExists = async (req: Request, res: Response, next: NextFunction) => {
  isFreetExists(req.params.freetId, res, next);
};

/**
 * Checks if a freet with parent is req.body exists
 */
const isParentFreetExists = async (req: Request, res: Response, next: NextFunction) => {
  req.body.parent ? isFreetExists(req.body.parent, res, next) : next();
};

/**
 * Checks if the content of the freet in req.body is valid, i.e not a stream of empty
 * spaces and not more than 140 characters
 */
const isValidFreetContent = (req: Request, res: Response, next: NextFunction) => {
  const {content} = req.body as {content: string};
  if (!content.trim()) {
    res.status(400).json({
      error: 'Freet content must be at least one character long.'
    });
    return;
  }

  if (content.length > 140) {
    res.status(413).json({
      error: 'Freet content must be no more than 140 characters.'
    });
    return;
  }

  next();
};

/**
 * Checks if the current user is the author of the freet whose freetId is in req.params
 */
const isValidFreetModifier = async (req: Request, res: Response, next: NextFunction) => {
  const freet = await FreetCollection.findOne(req.params.freetId);
  const userId = freet.authorId._id;
  if (req.session.userId !== userId.toString()) {
    res.status(403).json({
      error: 'Cannot modify other users\' freets.'
    });
    return;
  }

  next();
};

export {
  isValidFreetContent,
  isParamsFreetExists,
  isParentFreetExists,
  isValidFreetModifier
};
