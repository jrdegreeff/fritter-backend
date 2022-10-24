import type {HydratedDocument} from 'mongoose';
import type {PopulatedFeed} from './model';
import type {FreetResponse} from '../freet/util';
import * as freetUtil from '../freet/util';

export type FeedResponse = {
    name: string;
    sources: Array<string>;
    freets: Array<FreetResponse>;
};

/**
 * Transform a raw Feed object from the database into an object to be presented to the frontend.
 * 
 * @param feed the object to be transformed
 * @return the corresponding response object
 */
const constructFeedResponse = (feed: HydratedDocument<PopulatedFeed>): FeedResponse => {
    const feedCopy: PopulatedFeed = {
        ...feed.toObject({
            versionKey: false // Cosmetics; prevents returning of __v property
        })
    };
    return {
        name: feedCopy.name,
        sources: feedCopy.sources.map(s => s.username).sort(),
        freets: feedCopy.items.sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime())
                              .map(freetUtil.constructFreetResponseFromObject)
                              
    };
};

export {
    constructFeedResponse
};
