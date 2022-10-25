import axios from 'axios';

const baseURL = 'https://api.hanuultp.com';

describe('Test Success Case of Task', () => {
  let data = {
    title: 'Task One',
    description: 'Task One Description'
  }
  let taskId = '';
  afterAll(async () => {

  });

  it('Should return 200', async () => {
    axios.post(`${baseURL}/task`, data, {
      headers: {
        Authorization: ''
      }
    })
  })
  
});
