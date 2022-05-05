/* eslint-env jest */

const request = require('supertest');
const app = require('../app/src/main');
let token = '';

describe('GET /api/tickets', () => {

    /**
    * @test Test successful retrieval of tickets using GET /api/tickets.
    */
    test('To identify if tickets are retrieved correctly.', async () => {
        const response = await request(app)
        .get('/api/tickets')
        .send({ page_num : 1 })
        .expect('Content-Type', /json/)
        .expect(200)
    });
});

describe('POST /api/tickets', () => {

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
    * @test Test creation of correct ticket using POST /api/tickets.
    */
    test('Test to identify a ticket can be successfully created.', async () => {

        const ticket_body = {
            'ticket_title' : 'JEST Ticket',
            'ticket_status' : 'new',
            'ticket_priority' : 'low',
        };

        const response = await request(app)
        .post('/api/tickets')
        .set('cookie', `${token[0].split(';')[0]}`)
        .send(ticket_body);

        expect(response.body).toEqual({ 'msg' : 'Ticket created successfully.' });
        expect(response.statusCode).toBe(201);

    });
});