import { Fn, Stack, StackProps } from "aws-cdk-lib";
import * as iam from 'aws-cdk-lib/aws-iam';

import { Construct } from "constructs";

import {
  DomainName,
  LambdaIntegration,
  RestApi,
  SecurityPolicy,
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



const MAIN_REGION: REGION = "us-east-1";

// LIST OF REGIONS WHERE WE WANT TO DEPLOY OUR APPLICATION
const SECONDARY_REGIONS: REGION[] = ["eu-west-1", "ap-southeast-2"];

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

    // CREATE DYNAMODB TABLE
    let table = createTable(
      this,
      {
        region,
        tableName: `TasksTable${getTableSuffix()}`,
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

    // CODE FOR ADDING LAMBDA TO DIFFERENT SUB ROOTS
    // AUTHORIZER FUNCTION CREATION
    const authorizer = createCustomAuthorizer(this, region);
    const createTask = createTaskLambda(this, region, role);
    
    

    let taskResource = restApi.root.addResource("task");
    taskResource.addMethod(
      "POST",
      new LambdaIntegration(createTask, { proxy: true }),
      { authorizer }
    );
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

    // Warning: This does not yet evaluate the health of the target, and I don't feel like understand what that means exactly.
    // CfnRecordSet has a aliasTarget where we can set evaluateTargetHealth to true, but the docs are sparse on what data dnsName requires.
  }
}
