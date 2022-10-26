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
        try {
          if (typeof event["body"] === "string") {
            event["body"] = JSON.parse(event["body"]);
          }
        } catch (err) {
          console.log(err);
        }
        let body = event["body"];

        // DEFINE VALIDATION CONFIG FOR BODY
        let validationConfig: Helper.SuperValidationConfig = {
          title: {
            type: Helper.CustomValidatorType.STRING,
            otherValidations: [
              {
                type: Helper.OtherValidationTypes.MINIMUM_CHARACTERS,
                limit: 3,
                message: "Title is too small",
              },
              {
                type: Helper.OtherValidationTypes.MAXIMUM_CHARACTERS,
                limit: 30,
                message: "Title is too long",
              },
              {
                type: Helper.OtherValidationTypes.REGEX,
                message: "Title need to be alpha numeric, # or _",
              },
            ],
          },
          description: {
            type: Helper.CustomValidatorType.STRING,
          },
        };

        let errors = Helper.validateObject(body, validationConfig);

        if (errors.length) {
          return { body: JSON.stringify({ body, errors }), statusCode: 500 };
        } else {
          let existingData: any = (await TaskModel.default.Model.get({ id: params["taskId"] })).toJSON();

          existingData = JSON.parse(JSON.stringify(existingData));

          if (existingData) {
            let taskData = {
              id: existingData.id,
              title: body.title,
              description: body.description
            }

            if (existingData.status === 'Closed') {
              return {
                body: JSON.stringify({
                  message: "Task is in closed state, can not be updated",
                }),
                statusCode: 405
              };
            } else {
              let updateData = await TaskModel.default.update(taskData);
  
              return {
                body: JSON.stringify({
                  data: updateData,
                  message: "Task updated success fully",
                }),
                statusCode: 200,
              };
            }
          } else {
            return {
              body: JSON.stringify({
                message: "Task not found",
              }),
              statusCode: 404
            };
          }

        }
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
          message: "you are not authorized to perform this task",
        }),
        statusCode: 403
      };
    }
  } catch (err) {
    console.log(err);
  }
};
