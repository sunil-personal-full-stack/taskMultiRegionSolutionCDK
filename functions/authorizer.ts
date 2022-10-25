import { APIGatewayTokenAuthorizerHandler } from "aws-lambda";
import { dummyApplicationUser } from '../helper/index';

export const authorizer: APIGatewayTokenAuthorizerHandler = async (event) => {
    const token = event.authorizationToken;
    let effect = 'Deny';

    dummyApplicationUser.forEach(element => {
        if (element.api_key === token) {
            effect = 'Allow'
        }
    });

    
    return {
        principalId: 'user',
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: effect,
                    Resource: '*',
                },
            ],
        },
    }
};

export default authorizer;