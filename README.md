# ESRI Feature Processor

This is a node.js-based AWS lambda processor to extract, transform and load (ETL) ESRI point features into the Scout
data feeds database. This repo defines AWS lambda functions to ETL from Santa Clara and Venura AVLs.

Function definitions are organized by ESRI service provider names. `serverless.yml` references yml files under serverless-config directory.
They are named as `{ESRI_Provider}-functions.yml`

For example, santaclara_avl & ventura_avl functions process data from Interra Group ESRI service. Hence, function definitions can be found in
serverless-config/interra-group-avl-functions.yml.

## Deployment

This processor uses the [Serverless Framework](https://serverless.com/) for deployment.

To deploy the entire cloudformation stack:

```
% sls deploy --stage <stage> --envdir <environment variable file dir>
```

For example,

```
% sls deploy --stage itest --envdir ../nics-esrifeature-vars
```

To deploy just the function/nodejs code changes (much faster):

```
sls deploy --stage <stage> --envdir <environment variable file dir> --function santaclara-avl
```

For example,

```
% sls deploy --stage itest --envdir ../nics-esrifeature-vars -f santaclara-avl
```

## Environment Variables

The deployment looks for environment files within the given `--envdir` directory (no trailing-slash) named according
to the `--stage` argument & ESRI Service provider. It looks for couple of different files.
1. File with environment properties common to all functions: The file naming convention `{stage}-vars.yml`.
2. Files with environment properties specific to each ESRI Service provider: The file naming convention for functions specific to a ESRI service provider is {ESRI_Provider}/{stage}-vars.yml.

For example, santaclara_avl & ventura_avl functions process data from Interra Group ESRI service provider. Hence, when deploying these functions to stage `itest` with `envdir` of `.`, serverless
looks for files itest-vars.yml & interra/itest-vars.yml in the same directory as `serverless.yml` file.

An full sample of the expected serverless variables can be found in the dev-sample-vars.yml

This deployment leverages [serverless-secrets plugin](https://github.com/trek10inc/serverless-secrets) to store
paramters to the lambda function.

AWS stores these parameters in the Systems Manager parameter store. These parameters are encrypted in the parameter
store and require an AWS Key Management Service (KMS) key. This key is specified in the environment file.
 
The following table contains the variables used in this repository:

| Variable              | SSM Parmeter Name                         | Default Value |
| ------------------    | ----------------------------------------- | ------------- |
| ESRIAUTHURL           |                                           |               |
| ESRISECRET            | /interragroup/{stage}/esri-service-secret |               |
| ESRISERVICEURL        |                                           |               |
| ESRIUSER              |                                           |               |
| FEEDNAME              |                                           | unknown       |
| PGDATABASE            |                                           | $USER         |
| PGHOST                |                                           | localhost     |
| PGPASSWORD            | /scout/{stage}/pgpassword                 | $USER         |
| PGPORT                |                                           | 5432          |
| PGUSER                |                                           | $USER         |
| STALEDATAAFTERDAYS    |                                           | 7             |
| TOKENEXPIRESINMINUTES |                                           | 120           |

## Testing

You will need Docker and Docker Compose installed.

Setup to run tests: Note that Docker Compose references a preconfigured database image hosted using the AWS Elastic Container Registry
(ECR). You will need to use Docker to log into the registry before Docker will be able to pull the database image.
Sourcing in test.env as shown below takes care of this if you have AWS credentials setup.

Refer to the [AWS ECR documentation](https://docs.aws.amazon.com/AmazonECR/latest/userguide/ECR_AWSCLI.html)
for more information.
 
```
source test.env
```
 
Test with the following command:

```
% docker-compose up --abort-on-container-exit --exit-code-from esri_feature_proc
```
