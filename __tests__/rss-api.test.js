/* eslint-env jest */

const request = require('supertest');
const app = require('../app/src/main');
let token = '';

describe('GET /api/rss', () => {

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
    * @test Test successful retrieval of entries using GET /api/rss.
    */
    test('To identify if the default RSS feed is returned correctly.', async () => {
        const response = await request(app)
        .get('/api/rss')
        .set('cookie', `${token[0].split(';')[0]}`)
        .expect('Content-Type', /json/)
        .expect(200)
    });
});

describe('PATCH /api/rss/changesource', () => {

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
    * @test Test modification of valid RSS source using PATCH /api/rss/changesource.
    */
    test('Test to identify an RSS source can be successfully changed.', async () => {

        const rss_source_body = {
            'pref_rss_source' : 'https://www.darkreading.com/rss.xml'
        };

        const response = await request(app)
        .patch('/api/rss/changesource')
        .set('cookie', `${token[0].split(';')[0]}`)
        .send(rss_source_body);

        expect(response.statusCode).toBe(200);
    });
});