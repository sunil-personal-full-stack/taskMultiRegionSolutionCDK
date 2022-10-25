import { aws_lambda, aws_lambda_nodejs, Duration, Stack } from "aws-cdk-lib";

export function createCustomAuthorizer(scope: Stack, region: string): any {
  return new aws_lambda.Function(
    scope,
    "CircleCiAuthLambda",
    {
      runtime: aws_lambda.Runtime.NODEJS_14_X,
      handler: "authorizer.handler",
      timeout: Duration.seconds(30),
      code: aws_lambda.Code.fromAsset("functions/"),
    }
  );
}