require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });
    
    
    test('creates todos for user', async() => {

      const newItem =
        {
          'todo': 'gain funding',
          'complete': false
        };

      const expectation = 
        {
          ...newItem,
          'id': 4,
          'user_id': 2
        };

      const data = await fakeRequest(app)
        .post('/api/todos')
        .send(newItem)
        .set('Authorization', token)
        .expect('Content-Type', /json/);
        // .expect(200);

      expect(data.body).toEqual(expectation);
    });



    test('get todo-list for user', async() => {
      const expectation = [
        {
          'id': 4,
          'todo': 'gain funding',
          'complete': false,
          'user_id': 2
        }];

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });




    test('update a todo-item', async() => {
      const expectation = 
      {
        'id': 4,
        'todo': 'gain funding',
        'complete': true,
        'user_id': 2
      };

      const data = await fakeRequest(app)
        .put('/api/todos/4')
        .send(expectation)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
