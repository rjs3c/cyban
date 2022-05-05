/* eslint-env jest */

const { MongoClient, ObjectId } = require('mongodb');

describe('Ticket Manipulation', () => {
    
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
    * @test Test retrieval of stored logs within the logs collection.
    */
    test('Successfully retrieve all tickets.', async () => {
        const tickets = db.collection('tickets');

        const retrieved_tickets = await tickets.find({});

        expect(retrieved_tickets).not.toBeNull();
    });

    /**
    * @test Test direct creation of entry within the entries collection.
    */
    test('Successfully create a ticket.', async () => {
        const tickets = db.collection('tickets');
        const id = new ObjectId();

        const ticket_mock = {
            '_id' : id,
            'ticket_title' : 'Test Ticket',
            'ticket_status' : 'new',
            'ticket_priority' : 'low',
        };

        await tickets.insertOne(ticket_mock);

        const created_ticket = await tickets.findOne({
            _id : id
        });

        expect(created_ticket).toEqual(ticket_mock);
    });
});