/* eslint-env jest */

const request = require('supertest');
const app = require('../app/src/main');
let token = '';

describe('GET /api/logs', () => {

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
    * @test Test successful retrieval of logs using GET /api/logs.
    */
    test('To identify if logs are returned correctly.', async () => {
        const response = await request(app)
        .get('/api/logs')
        .send({ page_num : 1 })
        .set('cookie', `${token[0].split(';')[0]}`)
        .expect('Content-Type', /json/)
        .expect(200)
    });
});