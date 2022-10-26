export AWS_PROFILE=default

export DOMAIN_NAME="multiv5.hanuultp.com"
export HOSTED_ZONE_ID="Z09003082PGMU0TT38LYZ"

export AWS_REGION="us-east-1"
yarn cdk bootstrap
cdk synth
yarn deploy --require-approval never
export AWS_REGION="eu-west-1"
yarn cdk bootstrap
cdk synth
yarn deploy --require-approval never