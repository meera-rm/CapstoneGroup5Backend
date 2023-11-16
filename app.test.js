//michaels test jest

//importing our supertest and app for HTTP requests
const request= require('supertest')
const app = require('./app')

test('it should respond with hello world1', async() => {
  //we are going to send a request to our app and verify htat the response 
  ////matches what we expect

  
  const res = await request(app).get('/');
 // 'string' === 'string'
 expect(res.text).toBe('Hello World!');


 //create a route that shows a student's name based on the URL params
 test('it shoukd show the students name', async() => {
    const name='Michael'
    const res= await request(app).get(`/students/${name}`);
 })

})