import * as TaskModel from "../models/Task";
import * as Helper from "../helper/index";

export const handler = async (event: any): Promise<any> => {
  // GET USER API KEY
  try {
    const apiKey = event["headers"]["Authorization"];

    if (apiKey) {
      let role = Helper.getUserRole(apiKey);
      if (role === "admin") {
        let params = Helper.getRequestParameters(event);
        try {
          let memberId = params["memberId"];
          let taskDetails = (
            await TaskModel.default.Model.scan("assignedTo")
              .eq(memberId)
              .all()
              .exec()
          ).toJSON();

          return {
            body: JSON.stringify({
              data: taskDetails,
              message: "Task Detail Fetched",
            }),
            statusCode: 200,
          };
        } catch (err: any) {
          console.log(err);
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
            message: "User is not authorized to perform this action",
          }),
          statusCode: 403,
        };
      }
    }
  } catch (err) {
    console.log(err);
  }
};
