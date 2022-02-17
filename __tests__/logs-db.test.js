/* eslint-env jest */

const { MongoClient, ObjectId } = require('mongodb');

describe('Log Manipulation', () => {
    
    let db_handle;
    let db;
    const mongo_uri = 'mongodb://cyban-admin:cyban-admin-password@172.18.0.2:27017/?authSource=admin';

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
    * @test Test retrieval of stored logs within the logs collection.
    */
    test('Successfully retrieve all logs.', async () => {
        const logs = db.collection('logs');

        const retrieved_logs = await logs.find({});

        expect(retrieved_logs).not.toBeNull();
    });

    /**
    * @test Test direct creation of entry within the entries collection.
    */
    test('Successfully create a log entry.', async () => {
        const logs = db.collection('logs');
        const id = new ObjectId();

        const log_mock = {
            '_id' : id,
            'entry_title' : 'Test Entry',
            'entry_description' : 'Test entry description.',
            'entry_category' : 'risk',
            'entry_status' : 'todo'
        };

        await logs.insertOne(log_mock);

        const created_log = await logs.findOne({
            _id : id
        });

        expect(created_log).toEqual(log_mock);
    });
});