import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {PopulatedFreet} from '../freet/model';

// Update this if you add a property to the Freet type!
export type FreetResponse = {
  _id: string;
  author: string;
  dateCreated: string;
  parent: string;
  content: string;
  // dateModified: string;
};

/**
 * Encode a date as an unambiguous string
 *
 * @param {Date} date - A date object
 * @returns {string} - formatted date as string
 */
const formatDate = (date: Date): string => moment(date).format('MMMM Do YYYY, h:mm:ss a');

/**
 * Transform a raw Freet object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<PopulatedFreet>} freet - A freet
 * @returns {FreetResponse} - The freet object formatted for the frontend
 */
const constructFreetResponse = (freet: HydratedDocument<PopulatedFreet>): FreetResponse => {
  const freetCopy: PopulatedFreet = {
    ...freet.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  return constructFreetResponseFromObject(freetCopy);
};

const constructFreetResponseFromObject = (freet: PopulatedFreet): FreetResponse => {
  const {username} = freet.authorId;
  delete freet.authorId;
  return {
    ...freet,
    _id: freet._id.toString(),
    author: username,
    dateCreated: formatDate(freet.dateCreated),
    parent: freet.parent?.toString(),
    // dateModified: formatDate(freet.dateModified)
  };
}

export {
  constructFreetResponse,
  constructFreetResponseFromObject
};
