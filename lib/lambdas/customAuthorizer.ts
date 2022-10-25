import { aws_lambda_nodejs, Duration, Stack } from "aws-cdk-lib";

export function createCustomAuthorizer(scope: Stack, region: string): any {
  return new aws_lambda_nodejs.NodejsFunction(scope, "createCustomAuthorizer", {
    timeout: Duration.seconds(5),
    entry: "functions/authorizer.ts",
    environment: {
      region,
    },
  });
}