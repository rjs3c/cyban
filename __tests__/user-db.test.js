/* eslint-env jest */

const { MongoClient, ObjectId } = require('mongodb');

describe('User Manipulation', () => {
    
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
    * @test Test retrieval of stored entries within the entries collection.
    */
    test('Successfully create a user.', async () => {
        const users = db.collection('users');
        const id = new ObjectId();

        const user_mock = {
            '_id' : id,
            'username' : 'test_username',
            'password' : '$2y$10$fMY1oXH7uJ5b3pZUAoAEeO2npif.YUDZLH9FaiyZnLPcYr.zuGEwm' // testpassword
        }

        await users.insertOne(user_mock);

        const created_user = await users.findOne({
            username : user_mock.username,
            password : user_mock.password
        });

        expect(created_user).toEqual(user_mock);
    });
});