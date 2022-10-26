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
        if (role !== "admin" && params["status"] === "close") {
          return {
            body: JSON.stringify({
              message: "you are not authorized to perform this task",
            }),
            statusCode: 403,
          };
        }

        let status = params["status"];
        let taskStatus = "";

        switch (status) {
          case "accept":
            {
              taskStatus = "In-progress";
            }
            break;
          case "complete":
            {
              taskStatus = "Completed";
            }
            break;
          case "close":
            {
              taskStatus = "Closed";
            }
            break;
        }

        // GET CURRENT TASK DETAILS
        let currentTask = (await TaskModel.default.Model.get(params['taskId'])).toJSON();

        if (currentTask.status !== 'Closed') {
          currentTask.status = taskStatus || currentTask.status;

          let updateData: any = {
            status: taskStatus || currentTask.status,
            id: currentTask.id,
          }

          if (taskStatus === "Completed") {
            updateData['dateCompleted'] = new Date();
          }

          if (taskStatus === "Closed") {
            updateData['dateClosed'] = new Date();
          }

          await TaskModel.default.Model.update(updateData);

          return {
            body: JSON.stringify({
              message: "Task is now marked as " + taskStatus,
            }),
            statusCode: 200
          };

        } else {
          return {
            body: JSON.stringify({
              message: "Closed task can not be modified",
            }),
            statusCode: 405
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
