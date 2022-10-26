

import { Stack } from 'aws-cdk-lib';
import { PolicyDocument, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';


export function getAuthorizerRole(scope: Stack, region: string): Role {
  

  return new Role(scope, `authRoleRegionVise${region}`, {
    assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    inlinePolicies: {
      allowLambdaInvocation: PolicyDocument.fromJson({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: ['lambda:InvokeFunction', 'lambda:InvokeAsync'],
            Resource: `arn:aws:lambda:${scope.region}:${scope.account}:function:*`,
          },
        ],
      }),
    },
  });
}