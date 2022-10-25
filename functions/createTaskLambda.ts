import * as TaskModel from "../models/Task";
import * as Helper from "../helper/index";
const { v4: uuidv4 } = require("uuid");

export const handler = async (event: any): Promise<any> => {
  try {
    const token = event.authorizationToken;

    // GET USER API KEY
    const apiKey = event["headers"]["Authorization"];

    if (apiKey) {
      let role = Helper.getUserRole(apiKey);
      if (role === "admin") {
        try {
          try {
            if (typeof event["body"] === "string") {
              event["body"] = JSON.parse(event["body"]);
            }
          } catch (err) {}
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
                  limit: 20,
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
            let taskData = {
              id: uuidv4(),
              title: body.title,
              description: body.description,
              dateCreated: new Date(),
            };

            await TaskModel.default.Model.create(taskData);

            return {
              body: JSON.stringify({
                data: taskData,
                message: "Task added success fully",
              }),
              statusCode: 200,
            };
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
            message: "User is not authorized to perform this access",
          }),
          statusCode: 403,
        };
      }
    } else {
    }
  } catch (err) {
    console.log(err);
  }
};
