/* eslint-env jest */

const request = require('supertest');
const app = require('../app/src/main');
let token = '';

describe('GET /api/export', () => {

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
    * @test Test successful exportation of a PDF file / Executive Summary using GET /api/export.
    */
    test('To identify successful exportation of a PDF.', async () => {
        const response = await request(app)
        .get('/api/export?filename=test')
        .set('cookie', `${token[0].split(';')[0]}`)
        .expect('Content-Type', /pdf/)
        .expect(200)
    });
});