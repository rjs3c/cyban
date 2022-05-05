/* eslint-env jest */

const request = require('supertest');
const app = require('../app/src/main');
let token = '';

describe('POST /api/auth/register', () => {

    /**
    * @test Test successful registration of a user using POST /api/auth/register.
    */
    test('To identify if a user can be successfully registered.', async () => {

        const mock_user = {
            'username' : 'test_username',
            'password' : 'test_password'
        };

        const response = await request(app)
        .post('/api/auth/register')
        .send(mock_user)
        .expect('Content-Type', /json/)
        .expect(201)
    });

    /**
    * @test Test unsuccessful registration of an invalid user using POST /api/auth/register.
    */
    test('To identify if an invalid user can be rejected.', async () => {

        const invalid_mock_user = {
            'username' : 'u', // too short! 
            'password' : 'test_password'
        };

        const response = await request(app)
        .post('/api/auth/register')
        .send(invalid_mock_user);
        
        expect(response.body).toEqual({ 'msg' : 'Validation failed.' });
        expect(response.statusCode).toBe(400);
    });
});

describe('POST /api/auth/login', () => {

    /**
    * @test Test successful authentication of a user using POST /api/auth/login.
    */
    test('To identify if a user can be authenticated correctly.', async () => {

        const mock_user = {
            'username' : 'test_username',
            'password' : 'test_password'
        };

        const response = await request(app)
        .post('/api/auth/login')
        .send(mock_user);

        token = response.headers['set-cookie'];
        
        expect(response.body).toEqual({ 'msg' : 'Successfully authenticated.', 'username' : mock_user.username });
        expect(response.statusCode).toBe(200);
    });

    /**
    * @test Test unsuccessful authentication of a user using POST /api/auth/login.
    */
     test('To identify if authentication will fail correctly.', async () => {

        const mock_user = {
            'username' : 'test_username',
            'password' : 'test_incorrect_password'
        };

        const response = await request(app)
        .post('/api/auth/login')
        .send(mock_user);
        
        expect(response.body).toEqual({ 'msg' : 'Authentication failed.' });
        expect(response.statusCode).toBe(500);
    });

    /**
    * @test Test unsuccessful authentication of an invalid user using POST /api/auth/login.
    */
     test('To identify if authentication of an invalid user will fail correctly.', async () => {

        const mock_user = {
            'username' : 'u', // too short
            'password' : 'test_password'
        };

        const response = await request(app)
        .post('/api/auth/login')
        .send(mock_user);
        
        expect(response.body).toEqual({ 'msg' : 'Validation failed.' });
        expect(response.statusCode).toBe(400);
    });
});

describe('PATCH /api/users/changepassword', () => {

    /**
    * @test Test a valid user's password can be changed successfully using POST /api/users/changepassword.
    */
    test('To identify if a user\'s password can be changed correctly.', async () => {

        const mock_user = {
            'username' : 'test_username',
            'password' : 'test_new_password'
        };

        const response = await request(app)
        .patch('/api/users/changepassword')
        .set('cookie', `${token[0].split(';')[0]}`)
        .send(mock_user);
        
        expect(response.body).toEqual({ 'msg' : 'Password changed successfully.' });
        expect(response.statusCode).toBe(200);
    });

    /**
    * @test Test a valid user's invalid password won't be changed using POST /api/users/changepassword.
    */
     test('To identify if a user\'s invalid password change will fail.', async () => {

        const mock_user = {
            'username' : 'test_username',
            'password' : 'i' // invalid!
        };

        const response = await request(app)
        .patch('/api/users/changepassword')
        .set('cookie', `${token[0].split(';')[0]}`)
        .send(mock_user);
        
        expect(response.body).toEqual({ 'msg' : 'Validation failed.' });
        expect(response.statusCode).toBe(400);
    });
});

describe('DELETE /api/users/delete', () => {

    /**
    * @test Test a valid user's password can be changed successfully using POST /api/users/changepassword.
    */
    test('To identify if a user can be successfully deleted.', async () => {

        const mock_user = { 'username' : 'test_username' };

        const response = await request(app)
        .delete('/api/users/delete')
        .set('cookie', `${token[0].split(';')[0]}`)
        .send(mock_user);
        
        expect(response.body).toEqual({ 'msg' : 'Account deleted successfully.' });
        expect(response.statusCode).toBe(200);
    });

    /**
    * @test Test a valid user's invalid password won't be changed using POST /api/users/changepassword.
    */
     test('To identify if an invalid user cannot be successfully deleted.', async () => {

        const mock_user = { 'username' : 'test_invalid_username' };

        const response = await request(app)
        .delete('/api/users/delete')
        .set('cookie', `${token[0].split(';')[0]}`)
        .send(mock_user);
        
        expect(response.body).toEqual({ 'msg' : 'Account deletion failed.' });
        expect(response.statusCode).toBe(400);
    });
});