import { deleteRequest, postRequest } from './requestHelper';


describe('Task Add API Test Cases', () => { 
    let taskId = '';

    // AFTER PERFORMING ALL TASK ADD RELATED TEST, DELETE TASK ADDED SUCCESSFULLY
    afterAll(async () => {
        if (taskId) {
            await deleteRequest(`/task/${taskId}`, null, '7c158f3d-7fd1-49c3-a73c-eccb5dac1555');
        }
    });

    // ADD TASK SUCCESS CASE
    it('/task 200', async () => {
        const taskData = {
            title: 'Test Task',
            description: 'Test task description'
        }

        let data: any = await postRequest('/task', taskData, '7c158f3d-7fd1-49c3-a73c-eccb5dac1555');
        
        let parsedData = data.data ? JSON.parse(data.data) : {};

        if (parsedData.data && parsedData.data.id) {
            taskId = parsedData.data.id as string;
        }
        expect(data.statusCode).toBe(200);
    })

    // ADD TASK 400 CASE IN CASE OF INVALID CHARACTERS IN TITLE
    it('/task 400, for invalid character in title', async () => {
        const taskData = {
            title: 'Test Task $',
            description: 'Test task description'
        }

        let data: any = await postRequest('/task', taskData, '7c158f3d-7fd1-49c3-a73c-eccb5dac1555');
        
        let parsedData = data.data ? JSON.parse(data.data) : {};

        if (parsedData.data && parsedData.data.id) {
            taskId = parsedData.data.id as string;
        }
        expect(data.statusCode).toBe(400);
    });

    // ADD TASK 400 CASE IN CASE OF TITLE LENGTH TOO SMALL
    it('/task 400, for invalid length in title', async () => {
        const taskData = {
            title: 'Te',
            description: 'Test task description'
        }

        let data: any = await postRequest('/task', taskData, '7c158f3d-7fd1-49c3-a73c-eccb5dac1555');
        
        let parsedData = data.data ? JSON.parse(data.data) : {};

        if (parsedData.data && parsedData.data.id) {
            taskId = parsedData.data.id as string;
        }
        expect(data.statusCode).toBe(400);
    });

    // ADD TASK 400 CASE IN CASE OF TITLE LENGTH TOO BIG
    it('/task 400, for invalid length in title', async () => {
        const taskData = {
            title: 'Test case of the summary man and women',
            description: 'Test task description'
        }

        let data: any = await postRequest('/task', taskData, '7c158f3d-7fd1-49c3-a73c-eccb5dac1555');
        
        let parsedData = data.data ? JSON.parse(data.data) : {};

        if (parsedData.data && parsedData.data.id) {
            taskId = parsedData.data.id as string;
        }
        expect(data.statusCode).toBe(400);
    });

    // AUTHENTICATION ERROR IN CASE OF INVALID TOKEN PROVIDED
    it('/task 403, for invalid token', async () => {
        const taskData = {
            title: 'Te',
            description: 'Test task description'
        }

        let data: any = await postRequest('/task', taskData, '7c158f3d-7fd1-49c3-a73c-eccb5dac15jjjj55');
        
        let parsedData = data.data ? JSON.parse(data.data) : {};

        if (parsedData.data && parsedData.data.id) {
            taskId = parsedData.data.id as string;
        }
        expect(data.statusCode).toBe(403);
    });

    // AUTHENTICATION ERROR IN CASE OF MEMBER TRIED TO ADD TASK
    it('/task 403, for member user', async () => {
        const taskData = {
            title: 'Test Task',
            description: 'Test task description'
        }

        let data: any = await postRequest('/task', taskData, '07916ea7-e7ca-4f23-ae10-38831ca5f68b');
        expect(data.statusCode).toBe(403);
    })
})