/* eslint-env jest */

const { MongoClient, ObjectId } = require('mongodb');

describe('RSS Manipulation', () => {
    
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
    * @test Test retrieval of stored RSS preferences within the RSS collection.
    */
    test('Successfully retrieve all RSS preferences.', async () => {
        const rss = db.collection('rss');

        const retrieved_rss = await rss.find({});

        expect(retrieved_rss).not.toBeNull();
    });

    /**
    * @test Test correct creation of RSS preference within the RSS collection.
    */
    test('Successfully create an RSS preference.', async () => {
        const rss = db.collection('rss');
        const id = new ObjectId();

        const rss_mock = {
            '_id' : id,
            'user' : 'test_username',
            'pref_rss_source' : 'https://feeds.feedburner.com/TheHackersNews?format=xml',
        };

        await rss.insertOne(rss_mock);

        const created_rss = await rss.findOne({
            _id : id
        });

        expect(created_rss).toEqual(rss_mock);
    });
});