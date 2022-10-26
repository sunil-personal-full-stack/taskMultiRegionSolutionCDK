import { dummyApplicationUser } from "../helper/index";
import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
  APIGatewayTokenAuthorizerHandler,
} from "aws-lambda";

// Help function to generate an IAM policy
const generatePolicy = (
  principalId: string,
  effect: string,
  resource: string
) => {
  const policyDocument: any = {};
  if (effect && resource) {
    policyDocument.Version = "2012-10-17";
    policyDocument.Statement = [];

    const statementOne: any = {};
    statementOne.Action = "execute-api:Invoke";
    statementOne.Effect = effect;
    statementOne.Resource = resource;

    policyDocument.Statement.push(statementOne);
  }

  return policyDocument;
};

export const handler: APIGatewayTokenAuthorizerHandler = (
  event: APIGatewayTokenAuthorizerEvent,
  context: any,
  callback: any
) => {
  
  try {
    const token = event.authorizationToken;
    let effect = "Deny";
    dummyApplicationUser.forEach((element) => {
      if (element.api_key === token) {
        effect = "Allow";
      }
    });

    let result: APIGatewayAuthorizerResult = {
      policyDocument: generatePolicy("user", effect, "*"),
      principalId: "user",
    };

    callback(null, result);
  } catch (err) {
    console.log(err);
  }
};
