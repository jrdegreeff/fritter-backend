import type {HydratedDocument} from 'mongoose';
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
        children: threadCopy.children.map(freetUtil.constructFreetResponseFromObject)
    }
}

export {
    constructThreadResponse
};
