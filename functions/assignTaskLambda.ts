import * as TaskModel from "../models/Task";
import * as Helper from "../helper/index";

export const handler = async (event: any): Promise<any> => {
  // GET USER API KEY
  try {
    const apiKey = event["headers"]["Authorization"];

    if (apiKey) {
      let role = Helper.getUserRole(apiKey);
      let params = Helper.getRequestParameters(event);
      try {
        if (role !== "admin") {
          return {
            body: JSON.stringify({
              message: "you are not authorized to perform this task",
            }),
            statusCode: 403,
          };
        }

        let memberId = params["memberId"];
        let taskStatus = "Assigned";

        // GET CURRENT TASK DETAILS
        let currentTask = (
          await TaskModel.default.Model.get(params["taskId"])
        ).toJSON();

        if (currentTask.status !== "Closed") {
          currentTask.status = taskStatus || currentTask.status;
          currentTask.assignedTo = memberId;

          await TaskModel.default.Model.update(currentTask);

          return {
            body: JSON.stringify({
              message: "Task is now assigned",
            }),
            statusCode: 200,
          };
        } else {
          return {
            body: JSON.stringify({
              message: "Closed task can not be modified",
            }),
            statusCode: 405,
          };
        }
      } catch (err: any) {
        return {
          body: JSON.stringify({
            message: err.message,
          }),
          statusCode: 500,
        };
      }
    } else {
      return {
        body: JSON.stringify({
          message: "you are not authorized to perform this task",
        }),
        statusCode: 403,
      };
    }
  } catch (err) {
    console.log(err);
  }
};
