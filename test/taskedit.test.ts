import { deleteRequest, postRequest, putRequest } from './requestHelper';


describe('Task Edit API Test Cases', () => { 
    let taskId = '';

    // AFTER TESTING ALL EDIT RELATED APIS, DELETE TASK ADDED IN THIS TEST SUIT
    afterAll(async () => {
        if (taskId) {
            await deleteRequest(`/task/${taskId}`, null, '7c158f3d-7fd1-49c3-a73c-eccb5dac1555');
        }
    });

    // BEFORE STARTING TEST FOR EDIT API, WE NEED TASK TO BE ADDED
    beforeAll(async () => {
        const taskData = {
            title: 'Test Task',
            description: 'Test task description'
        }

        let data: any = await postRequest('/task', taskData, '7c158f3d-7fd1-49c3-a73c-eccb5dac1555');
        
        let parsedData = data.data ? JSON.parse(data.data) : {};

        if (parsedData.data && parsedData.data.id) {
            taskId = parsedData.data.id as string;
        }
    });

    // TASK EDIT SUCCESS CASE TESTING
    it('/task/{taskId} 200, Task edit with success case', async () => {
        const taskData = {
            title: 'Test Task',
            description: 'Test task description'
        }

        let data: any = await putRequest(`/task/${taskId}`, taskData, '7c158f3d-7fd1-49c3-a73c-eccb5dac1555');
        expect(data.statusCode).toBe(200);
    })

    // TASK EDIT WITH INVALID CHARACTER TEST CASE
    it('/task/{taskId} 400, Task update with invalid character in request', async () => {
        const taskData = {
            title: 'Test Task $',
            description: 'Test task description'
        }

        let data: any = await putRequest(`/task/${taskId}`, taskData, '7c158f3d-7fd1-49c3-a73c-eccb5dac1555');
        expect(data.statusCode).toBe(400);
    });

    // TASK EDIT WITH INVALID LENGTH IN TITLE
    it('/task/{taskId} 400, for invalid length in title', async () => {
        const taskData = {
            title: 'Te',
            description: 'Test task description'
        }

        let data: any = await putRequest(`/task/${taskId}`, taskData, '7c158f3d-7fd1-49c3-a73c-eccb5dac1555');
        expect(data.statusCode).toBe(400);
    });

    // TASK EDIT INVALID TOKE TEST CASE
    it('/task/{taskId} 403, for invalid token', async () => {
        const taskData = {
            title: 'Tess',
            description: 'Test task description'
        }

        let data: any = await putRequest(`/task/${taskId}`, taskData, '7c158f3d-7fd1-49c3-a73c-eccb5dac15jjjj55');
        expect(data.statusCode).toBe(403);
    });

    // TASK EDIT IN CASE TASK ID IS NOT VALID
    it('/task/{taskId} 404, for invalid task id', async () => {
        const taskData = {
            title: 'Test data',
            description: 'Test task description'
        }

        let data: any = await putRequest(`/task/${taskId}ssss`, taskData, '7c158f3d-7fd1-49c3-a73c-eccb5dac1555');
        expect(data.statusCode).toBe(404);
    });
})