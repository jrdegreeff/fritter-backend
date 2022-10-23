import {HydratedDocument, Types} from 'mongoose';
import type {PopulatedThread} from './model';
import ThreadModel from './model';

class ThreadCollection {

    /**
     * Create a thread document.
     * 
     * @param freetId the id of the freet whose thread document should be created
     */
    static async addOne(freetId: Types.ObjectId, parent: Types.ObjectId | string | undefined): Promise<void> {
        const lineage = parent ? [...(await ThreadModel.findOne({freet: parent}).exec()).lineage, parent] : [];
        const thread = new ThreadModel({
            freet: freetId,
            lineage,
            children: []
        });
        await thread.save();
        if (parent) {
            await ThreadModel.updateOne({freet: parent}, {$addToSet: {children: freetId}});
        }
    }

    /**
     * Find a thread document.
     * 
     * @param freetId the id of the freet whose thread to find
     */
    static async findOne(freetId: Types.ObjectId | string): Promise<HydratedDocument<PopulatedThread>> {
        return await ThreadModel.findOne({freet: freetId})
                          .populate('freet')
                          .populate('lineage')
                          .populate('children');
    }

    /**
     * Delete a thread document.
     * 
     * @param freetId the id of the freet whose thread to delete
     */
    static async deleteOne(freetId: Types.ObjectId | string): Promise<void> {
        const thread = await ThreadModel.findOne({freet: freetId}).exec();
        if (thread.lineage.length) {
            const parentId = thread.lineage[thread.lineage.length - 1]._id;
            await ThreadModel.updateOne({freet: parentId}, {$pullAll: {children: [freetId]}});
        }
        const descendants = await ThreadModel.find({lineage: freetId}).exec();
        for (const descendant of descendants) {
            const removeIndex = descendant.lineage.findIndex(id => (id.toString() === freetId));
            descendant.lineage = descendant.lineage.slice(removeIndex + 1);
            descendant.save();
        }
        thread.delete();
    }

}

export default ThreadCollection;