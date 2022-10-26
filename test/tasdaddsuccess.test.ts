const axios = require('supertest')

const baseURL = 'https://multiv4.hanuultp.com';

describe('Task Add', () => {
  let taskData = {
    title: 'Task One',
    description: 'Task One Description'
  }
  let taskId = '';
  afterAll(async () => {
    if (taskId) {
      const result = await axios.default.delete(`${baseURL}/task/${taskId}`, {
        headers: {
          Authorization: '7c158f3d-7fd1-49c3-a73c-eccb5dac1589'
        }
      });
    }
  });

  it('Should return 403', async () => {
    const { data: any, status } = await axios.default.post(`${baseURL}/task`, taskData, {
      headers: {
        Authorization: '7c158f3d-7fd1-49c3-a73c-eccb5dac1589'
      }
    });

    expect(status).toBe(403);
  });

  it('Should return success', async () => {
    const result = await axios.default.post(`${baseURL}/task`, taskData, {
      headers: {
        Authorization: '7c158f3d-7fd1-49c3-a73c-eccb5dac1555'
      }
    });

    if (result.data['data']['id']) {
      taskId = result.data['data']['id'];
    }

    expect(result.status).toBe(200);
  });
  
});
