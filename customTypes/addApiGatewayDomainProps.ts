import { RestApi } from "aws-cdk-lib/aws-apigateway";

export interface AddApiGateWayDomainNameProps {
    region: string;
    domainName: string;
    restApi: RestApi;
    hostedZoneId: string;
}
