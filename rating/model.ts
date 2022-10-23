import type {Types} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {PopulatedFreet} from '../freet/model';

type ParameterizedRating<I> = {
    _id: Types.ObjectId;
    freet: I;
    rating: number;
};

export type Rating = ParameterizedRating<Types.ObjectId>;
export type PopulatedRating = ParameterizedRating<PopulatedFreet>;

const RatingSchema = new Schema<Rating>({
    // The freet
    freet: {
        type: Schema.Types.ObjectId,
        required: true,
        unique: true,
        ref: 'Freet'
    },
    // The rating
    rating: {
        type: Schema.Types.Number,
        required: true
    }
});

const RatingModel = model<Rating>('Rating', RatingSchema);
export default RatingModel;
