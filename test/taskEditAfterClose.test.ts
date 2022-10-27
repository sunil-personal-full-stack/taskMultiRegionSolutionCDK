import {
  deleteRequest,
  getRequest,
  postRequest,
  putRequest,
} from "./requestHelper";

describe("Task Status Change API", () => {
  let taskId = "";

  afterAll(async () => {
    if (taskId) {
      // await deleteRequest(`/task/${taskId}`, null, '7c158f3d-7fd1-49c3-a73c-eccb5dac1555');
      await deleteRequest(
        `/task/${taskId}`,
        null,
        "7c158f3d-7fd1-49c3-a73c-eccb5dac1555"
      );
    }
  });

  beforeAll(async () => {
    const taskData = {
      title: "Test Task",
      description: "Test task description",
    };

    let data: any = await postRequest(
      "/task",
      taskData,
      "7c158f3d-7fd1-49c3-a73c-eccb5dac1555"
    );

    let parsedData = data.data ? JSON.parse(data.data) : {};

    if (parsedData.data && parsedData.data.id) {
      taskId = parsedData.data.id as string;

      await putRequest(
        `/task/${taskId}/close`,
        null,
        "7c158f3d-7fd1-49c3-a73c-eccb5dac1555"
      );
    }
  });

  it("/task/{taskId} 200, Task edit with success case", async () => {
    const taskData = {
      title: "Test Task",
      description: "Test task description",
    };

    let data: any = await putRequest(
      `/task/${taskId}`,
      taskData,
      "7c158f3d-7fd1-49c3-a73c-eccb5dac1555"
    );
    expect(data.statusCode).toBe(405);
  });
});
