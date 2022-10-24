import type {HydratedDocument, Types} from 'mongoose';
import type {PopulatedThread} from './model';
import type {FreetResponse} from '../freet/util';
import * as freetUtil from '../freet/util';

export type ThreadResponse = {
    lineage: Array<FreetResponse>;
    freet: FreetResponse;
    children: Array<FreetResponse>;
}

/**
 * Transform a raw Thread object from the database into an object to be presented to the frontend.
 * 
 * @param thread the object to be transformed
 * @return the corresponding response object
 */
const constructThreadResponse = (thread: HydratedDocument<PopulatedThread>): ThreadResponse => {
    const threadCopy: PopulatedThread = {
        ...thread.toObject({
            versionKey: false // Cosmetics; prevents returning of __v property
        })
    };
    return {
        lineage: threadCopy.lineage.map(freetUtil.constructFreetResponseFromObject),
        freet: freetUtil.constructFreetResponseFromObject(threadCopy.freet),
        children: threadCopy.children.map(child => ({
            ...freetUtil.constructFreetResponseFromObject(child.freet),
            rating: child.rating
        })).sort((a, b) => b.rating - a.rating)
    };
}

/**
 * Evaluate the relevance of a freet to its context.
 * 
 * @param freet the freet to evalutate
 * @param context the context to evaluate it against
 * @return a number from 0 to 1 with 1 being completely relevant and 0 being completely irrelevant
 */
const rateRelevance = (freet: Types.ObjectId, context: Array<Types.ObjectId>): number => {
    // In a real application this would be some sort of natural language model
    // But for this demo application, I am just using a random number as a POC
    return Math.random();
}

export {
    constructThreadResponse,
    rateRelevance
};
