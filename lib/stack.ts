import { Fn, Stack, StackProps } from "aws-cdk-lib";
import * as iam from 'aws-cdk-lib/aws-iam';

import { Construct } from "constructs";

import {
  AuthorizationType,
  DomainName,
  LambdaIntegration,
  RestApi,
  SecurityPolicy,
  TokenAuthorizer,
} from "aws-cdk-lib/aws-apigateway";
import {
  ARecord,
  CfnHealthCheck,
  CfnRecordSet,
  HostedZone,
  RecordTarget,
} from "aws-cdk-lib/aws-route53";
import { DnsValidatedCertificate } from "aws-cdk-lib/aws-certificatemanager";
import { ApiGatewayDomain } from "aws-cdk-lib/aws-route53-targets";



import { addHealthCheckEndpoint, createRestApi } from "./api";
import { REGION } from "./../customTypes/region";
import { createTable, getTableSuffix } from "./dynamodb";
import { AddApiGateWayDomainNameProps } from "../customTypes/addApiGatewayDomainProps";
import { createTaskLambda } from "./lambdas/createTask";
import { createCustomAuthorizer } from "./lambdas/customAuthorizer";
import { updateTaskLambda } from "./lambdas/updateTask";
import { getAuthorizerRole } from "./authRole";
import { deleteTaskLambda } from "./lambdas/deleteTask";
import { getTaskLambda } from "./lambdas/getTask";
import { getMemberTaskLambda } from "./lambdas/getMemberTask";
import { statusChangeTaskLambda } from "./lambdas/statusChangeTask";



const MAIN_REGION: REGION = "eu-west-1";

// LIST OF REGIONS WHERE WE WANT TO DEPLOY OUR APPLICATION
const SECONDARY_REGIONS: REGION[] = ['us-east-1'];

export class MultiApp extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: StackProps & { hostedZoneId: string; domainName: string }
  ) {
    super(scope, id, props);

    if (!props.env?.region) {
      throw Error(
        "Could not resolve region. Please pass it with the AWS_REGION environment variable."
      );
    }
    if (!props.hostedZoneId) {
      throw Error(
        "Could not resolve hostedZoneId. Please pass it with the HOSTED_ZONE_ID environment variable."
      );
    }
    if (!props.domainName) {
      throw Error(
        "Could not resolve domainName. Please pass it with the DOMAIN_NAME environment variable."
      );
    }

    if (
      !SECONDARY_REGIONS.includes(props.env.region as REGION) &&
      props.env.region != MAIN_REGION
    ) {
      throw Error("We do not support to deploy in this region");
    }

    const { hostedZoneId, domainName } = props;
    const region: REGION = props.env.region as REGION;

    // CREATE IAM POLICY
    const role = new iam.Role(this, 'lambda-role', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Common Role For all Lambda functions'
    })

    role.addManagedPolicy(iam.ManagedPolicy.fromManagedPolicyArn(this, 'basic-lambda', 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'));

    // CREATE DYNAMODB TABLE
    let table = createTable(
      this,
      {
        region,
        tableName: `TasksTableV9${getTableSuffix()}`,
        replicationRegions: SECONDARY_REGIONS,
      },
      MAIN_REGION
    );

    table.grantFullAccess(role);

    // CREATE API GATEWAY
    const restApi: RestApi = createRestApi(this, { region });

    // ADD HEALTH CHECK ENDPOINT
    addHealthCheckEndpoint(restApi);

    // ADD DOMAIN TO API GATEWAY
    this.addApiGateWayDomainName({ domainName, restApi, hostedZoneId, region });
    
    const authRole = getAuthorizerRole(this, region);
    // AUTHORIZER FUNCTION CREATION
    const lambdaAuthorizer = createCustomAuthorizer(this, region, role);
      
    const customAuthorizer = new TokenAuthorizer(this, 'AppAuthorizerV4', {
      handler: lambdaAuthorizer,
      authorizerName: 'AppAuthorizerV8',
      assumeRole: authRole
    });

    let taskResource = restApi.root.addResource("task");  

    // CODE FOR ADDING LAMBDA TO DIFFERENT SUB ROOTS
    const createTask = createTaskLambda(this, region, role);
    const updateTask = updateTaskLambda(this, region, role);
    const deleteTask = deleteTaskLambda(this, region, role);
    const getTask = getTaskLambda(this, region, role);
    const getMemberTask = getMemberTaskLambda(this, region, role);
    const statusChangeTask = statusChangeTaskLambda(this, region, role);

    // ADD CREATE TASK API
    taskResource.addMethod("POST", new LambdaIntegration(createTask), {authorizationType: AuthorizationType.CUSTOM, authorizer: customAuthorizer });


    // ADD UPDATE TASK API {taskId} RESOURCES
    let currentTaskResource = taskResource.addResource('{taskId}');
    
    /**
     * PUT /task/{taskId}/assign/{memberId} 
     */
    currentTaskResource.addMethod('PUT', new LambdaIntegration(updateTask), { authorizationType: AuthorizationType.CUSTOM, authorizer: customAuthorizer });
    currentTaskResource.addMethod('DELETE', new LambdaIntegration(deleteTask), { authorizationType: AuthorizationType.CUSTOM, authorizer: customAuthorizer });
    currentTaskResource.addMethod('GET', new LambdaIntegration(getTask), { authorizationType: AuthorizationType.CUSTOM, authorizer: customAuthorizer });

    /**
     * PUT /task/{taskId}/accept
     * PUT /task/{taskId}/complete
     * PUT /task/{taskId}/close
     */
    let statusResource = currentTaskResource.addResource('{status}');
    statusResource.addMethod('PUT', new LambdaIntegration(statusChangeTask), { authorizationType: AuthorizationType.CUSTOM, authorizer: customAuthorizer });
    
    let assignResource = (currentTaskResource.addResource('assign')).addResource('{memberId}');
    assignResource.addMethod('PUT', new LambdaIntegration(getMemberTask), { authorizationType: AuthorizationType.CUSTOM, authorizer: customAuthorizer });
    
    
    
    
    // MEMBER ID SPECIFIC RESOURCE
    let memberTaskResource = (taskResource.addResource('list')).addResource('{memberId}');
    memberTaskResource.addMethod('GET', new LambdaIntegration(getMemberTask), { authorizationType: AuthorizationType.CUSTOM, authorizer: customAuthorizer });
  }

  private addApiGateWayDomainName({
    domainName,
    restApi,
    hostedZoneId,
    region,
  }: AddApiGateWayDomainNameProps) {
    const hostedZone = HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
      hostedZoneId,
      zoneName: domainName,
    });

    // Certificate names must be globally unique
    const certificate = new DnsValidatedCertificate(
      this,
      `${region}Certificate`,
      {
        domainName,
        hostedZone,
        region,
      }
    );
    const apigwDomainName = new DomainName(this, `${region}DomainName`, {
      domainName,
      certificate,
      securityPolicy: SecurityPolicy.TLS_1_2,
    });

    // We need to call addBasePathMapping, so that the custom domain gets connected with our rest api
    apigwDomainName.addBasePathMapping(restApi);

    const executeApiDomainName = Fn.join(".", [
      restApi.restApiId,
      "execute-api",
      region,
      Fn.ref("AWS::URLSuffix"),
    ]);
    const healthCheck = new CfnHealthCheck(this, `${region}HealthCheck`, {
      healthCheckConfig: {
        type: "HTTPS",
        fullyQualifiedDomainName: executeApiDomainName,
        port: 443,
        requestInterval: 30,
        resourcePath: `/${restApi.deploymentStage.stageName}/health`,
      },
    });

    const dnsRecord = new ARecord(this, `${region}`, {
      zone: hostedZone,
      target: RecordTarget.fromAlias(new ApiGatewayDomain(apigwDomainName)),
    });
    const recordSet = dnsRecord.node.defaultChild as CfnRecordSet;
    recordSet.region = region;
    recordSet.healthCheckId = healthCheck.attrHealthCheckId;
    recordSet.setIdentifier = `${region}Api`;
  }
}
