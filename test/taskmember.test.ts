import { deleteRequest, getRequest, postRequest, putRequest } from './requestHelper';

describe('Task Assign API Test Cases', () => { 
    let taskId = 'a5ce43f2-53db-11ed-bdc3-0242ac120002';
    const memberId = 'a5ce43f2-53db-11ed-bdc3-0242ac120002';
    afterAll(async () => {
        if (taskId) {
            await deleteRequest(`/task/${taskId}`, null, '7c158f3d-7fd1-49c3-a73c-eccb5dac1555');
        }
    });
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

    // TEST SUCCESS CASE FOR ASSIGN MEMBER
    it('/task/{taskId}/assign/{memberId} 200, success add case for the task.', async () => {
        console.log(`/task/${taskId}/assign/${memberId}`,'---')
        let data: any = await putRequest(`/task/${taskId}/assign/${memberId}`, null, '7c158f3d-7fd1-49c3-a73c-eccb5dac1555');
        expect(data.statusCode).toBe(200);
    })

    // TEST INVALID TASK ID CASE
    it('/task/{taskId}/assign/{memberId} 404, task not found.', async () => {
        let data: any = await putRequest(`/task/${taskId}sss/assign/${memberId}`, null, '7c158f3d-7fd1-49c3-a73c-eccb5dac1555');
        expect(data.statusCode).toBe(404);
    });

    // TEST NON ADMIN USER ASSIGN TASK
    it('/task/{taskId}/assign/{memberId} 403, task not found.', async () => {
        let data: any = await putRequest(`/task/${taskId}/assign/${memberId}`, null, '07916ea7-e7ca-4f23-ae10-38831ca5f68b');
        expect(data.statusCode).toBe(403);
    });

    // LIST MEMBER TASK IN CASE MEMBER TASK ASSIGNED
    it('/task/list/{memberId} 200, task list after task assigned', async () => {
        let data: any = await getRequest(`/task/list/${memberId}`, null, '07916ea7-e7ca-4f23-ae10-38831ca5f68b');
        expect(data.statusCode).toBe(200);
    });
})