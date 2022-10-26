import { Cors, MethodLoggingLevel, MockIntegration, PassthroughBehavior, RestApi } from "aws-cdk-lib/aws-apigateway";
import { aws_lambda } from 'aws-cdk-lib';
import { Construct } from "constructs";

import * as path from 'path';
interface CreateRestApiProps {
    region: string;
}

const METHOD_OPTIONS = {methodResponses: [{statusCode: '200'}, {statusCode: '400'}, {statusCode: '500'}]};

export function createRestApi(scope: Construct, { region }: CreateRestApiProps): RestApi {

    const api = new RestApi(scope, "Api", {
        restApiName: "taskAPI",
        defaultCorsPreflightOptions: {
            allowOrigins: Cors.ALL_ORIGINS,
        },
        deployOptions: {
            variables: {
                REGION: region,
            },
            loggingLevel: MethodLoggingLevel.INFO
        }
    });

    return api;
}

export function addHealthCheckEndpoint(api: RestApi) {
    const healthCheckIntegration = new MockIntegration({
        integrationResponses: [
            { statusCode: '200' },
        ],
        passthroughBehavior: PassthroughBehavior.NEVER,
        requestTemplates: {
            'application/json': JSON.stringify({statusCode: 200}),
        },
    });

    const health = api.root.addResource('health');
    health.addMethod('GET', healthCheckIntegration, METHOD_OPTIONS);
}