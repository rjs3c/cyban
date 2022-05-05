/* eslint-env jest */

const request = require('supertest');
const app = require('../app/src/main');
let token = '';

describe('GET /api/entries', () => {

    /**
    * @test Test successful retrieval of entries using GET /api/entries.
    */
    test('To identify if entries are returned correctly.', async () => {
        const response = await request(app)
        .get('/api/entries')
        .expect('Content-Type', /json/)
        .expect(200)

    });
});

describe('POST /api/entries/', () => {

    /**
     * Authenticate as to avoid 'Not authenticated' response.
     */
     beforeAll(async () => {
        const response = await request(app)
        .post('/api/auth/login')
        .send({ username : 'test_username', password : 'test_password' });

        token = response.headers['set-cookie'];
    });
    
    /**
    * @test Test creation of correct entry using POST /api/entries.
    */
    test('Test to identify an entry can be successfully created.', async () => {

        const entry_body = {
            'entry_title' : 'JEST Entry',
            'entry_category' : 'event',
            'entry_status' : 'todo',
            'entry_priority' : 'high'
        };

        const response = await request(app)
        .post('/api/entries')
        .set('cookie', `${token[0].split(';')[0]}`)
        .send(entry_body);

        expect(response.body).toEqual({ 'msg' : 'Entry created successfully.' });
        expect(response.statusCode).toBe(201);

    });

    /**
    * @test Test creation of invalid entry using POST /api/entries.
    */
    test('Test to identify the correct response to invalid entry data.', async () => {

        const entry_body = { 
            // Missing entry_title!
            'entry_category' : 'event',
            'entry_status' : 'todo',
            'entry_priority' : 'high'
        };

        const response = await request(app)
        .post('/api/entries')
        .set('cookie', `${token[0].split(';')[0]}`)
        .send(entry_body);

        expect(response.body).toEqual({ 'msg' : 'Validation failed.' });
        expect(response.statusCode).toBe(400);

    });
});


describe('PATCH /api/entries/:id', () => {

    /**
     * Authenticate as to avoid 'Not authenticated' response.
     */
     beforeAll(async () => {
        const response = await request(app)
        .post('/api/auth/login')
        .send({ username : 'test_username', password : 'test_password' });

        token = response.headers['set-cookie'];
    });

    /**
    * @test Test modification of entry using PATCH /api/entries.
    */
    test('Test to identify if an entry can be successfully modified.', async () => {

        // Retrieving specific entry previously created.
        const entries = await request(app)
        .get('/api/entries');

        const { _id } = entries.body.find(entries => entries.entry_title === 'JEST Entry');

        const entry_body = {
            'entry_title' : 'Modified JEST Entry',
            'entry_category' : 'event',
            'entry_status' : 'done',
            'entry_priority' : 'high'
        };

        const response = await request(app)
        .patch(`/api/entries/${_id}`)
        .set('cookie', `${token[0].split(';')[0]}`)
        .send(entry_body);

        expect(response.body).toEqual({ 'msg' : 'Entry successfully updated.' });
        expect(response.statusCode).toBe(200);
    })

    /**
    * @test Test modification of invalid entry using PATCH /api/entries.
    */
    test('Test to identify appropriate response to an invalid entry.', async () => {

        // Retrieving specific entry previously created.
        const entries = await request(app)
        .get('/api/entries')

        const _id = 1; // Invalid

        const entry_body = {
            'entry_title' : 'Invalid Test Entry',
            'entry_category' : 'event',
            'entry_status' : 'done',
            'entry_priority' : 'high'
        };

        const response = await request(app)
        .patch(`/api/entries/${_id}`)
        .set('cookie', `${token[0].split(';')[0]}`)
        .send(entry_body);

        expect(response.body).toEqual({ 'msg' : 'Validation failed.' });
        expect(response.statusCode).toBe(400);
    })
});


describe('DELETE /api/entries/:id', () => {

    /**
     * Authenticate as to avoid 'Not authenticated' response.
     */
     beforeAll(async () => {
        const response = await request(app)
        .post('/api/auth/login')
        .send({ username : 'test_username', password : 'test_password' });

        token = response.headers['set-cookie'];
    });

    /**
    * @test Test deletion of entry using DELETE /api/entries.
    */
    test('Test to identify if an entry can be successfully removed.', async () => {
        
        // Retrieving specific entry previously created.
        const entries = await request(app)
        .get('/api/entries')

        const { _id } = entries.body.find(entries => entries.entry_title === 'Modified JEST Entry');

        const response = await request(app)
        .delete(`/api/entries/${_id}`)
        .set('cookie', `${token[0].split(';')[0]}`);

        expect(response.body).toEqual({ 'msg' : 'Entry successfully deleted.' });
        expect(response.statusCode).toBe(200);
    });

    /**
    * @test Test deletion of invalid entry using DELETE /api/entries.
    */
     test('Test to identify appropriate response to invalid entry.', async () => {
    
        const _id = 1;

        const response = await request(app)
        .delete(`/api/entries/${_id}`)
        .set('cookie', `${token[0].split(';')[0]}`);

        expect(response.body).toEqual({ 'msg' : 'Validation failed.' });
        expect(response.statusCode).toBe(400);
    });
});