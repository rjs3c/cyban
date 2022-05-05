/* eslint-env jest */

const { MongoClient } = require('mongodb');

describe('Entry Manipulation', () => {
    
    let db_handle;
    let db;
    const mongo_uri = 'mongodb://cyban-admin:cyban-admin-password@172.19.0.3:27017/?authSource=admin';

    /**
     * Create pre-requisite MongoDB connection.
     */
    beforeAll(async () => {
        db_handle = await MongoClient.connect(mongo_uri, {
            useNewUrlParser : true
        });

        db = await db_handle.db(db='cyban-db', username='cyban-admin', password='cyban-admin-password', host=mongo_uri);
    });

    /**
     * Close JEST's open MongoDB handle.
     */
    afterAll(async () => {
        await db_handle.close();
    });

    /**
    * @test Test retrieval of stored entries within the entries collection.
    */
    test('Successfully retrieve all entries.', async () => {
        const entries = db.collection('entries');

        const retrieved_entries = await entries.find({});

        expect(retrieved_entries).not.toBeNull();
    });

    /**
    * @test Test direct creation of entry within the entries collection.
    */
    test('Successfully create an entry.', async () => {
        const entries = db.collection('entries');

        const entry_mock = {
            '_id' : '61b9f863ac740c5544075304',
            'entry_title' : 'Test Entry',
            'entry_category' : 'risk',
            'entry_status' : 'todo',
            'entry_priority' : 'high'
        };

        await entries.insertOne(entry_mock);

        const created_entry = await entries.findOne({
            _id : '61b9f863ac740c5544075304'
        });

        expect(created_entry).toEqual(entry_mock);
    }); 

    /**
    * @test Test direct modification of entry within the entries collection.
    */
    test('Successfully update an entry.', async () => {
        const entries = db.collection('entries');

        const entry_mock = {
            '_id' : '61b9f863ac740c5544075304',
            'entry_title' : 'Modified Test Entry',
            'entry_category' : 'risk',
            'entry_status' : 'done',
            'entry_priority' : 'high'
        };

        await entries.updateOne(
            { _id : '61b9f863ac740c5544075304' },
            { $set : { 
                'entry_title' : 'Modified Test Entry', 
                'entry_category' : 'risk',
                'entry_status' : 'done',
                'entry_priority' : 'high'
            }},
            { upsert : true }
        );

        const updated_entry = await entries.findOne({
            _id : '61b9f863ac740c5544075304'
        });

        expect(updated_entry).toEqual(entry_mock);
    }); 

    /**
    * @test Test direct removal of entry within the entries collection.
    */
    test('Successfully delete an entry', async () => {
        const entries = db.collection('entries');

        await entries.findOneAndDelete({
            _id : '61b9f863ac740c5544075304'
        });

        const deleted_entry = await entries.findOne({
            _id : '61b9f863ac740c5544075304'
        });

        expect(deleted_entry).toEqual(null);
    });
});