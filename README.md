# nics-esrifeature-processor
This is a Node.js based AWS lambda processor to ETL Esri point features into Scout datafeeds db. It defines multiple lambda functions to support ETL from different sources. Below is the list of supported data feeds.
- Santaclara AVL
- Ventura AVL

# Deployment commands
To deploy the entire cloudformation stack:

sls deploy --stage <stage> --envdir <environment variable file dir>

sls deploy --stage itest --envdir ../nics-esrifeature-vars

To deploy just the function/nodejs code changes (much faster)

sls deploy --stage <stage> --envdir <environment variable file dir> --function santaclara-avl

ex.: sls deploy --stage itest --envdir ../nics-esrifeature-vars -f santaclara-avl

Notes:
Serverless framework - The serverless framework is utilized for deployment, see the
documentation here: https://serverless.com/

## Environment variables
The deployment looks for an environment file within the given --envdir directory (no trailing-slash)
named according to the --stage argument as {stage}-vars.yml

For example: A deployment with the stage of "dev" and a envdir of "." would look for
a dev-vars.yml file in the same directory as the serverless.yml directory.
Ex: sls deploy --stage dev --envdir .

An full sample of the expected serverless variable can be found in the dev-sample-vars.yml

### Encryption/Decryption of secret environment variables.
The encrypted variables for PGPASSWORD and ESRISECRET are retrieved from AWS SSM. As such, a valid kms
decryption key arn must be specified in order for these environment variables to be decrypted. The servlerless deployment
script grant the lambda role access to the key specified in the {stage}-vars.yml for the stage.

SSM variable naming is based on the deployment stage as below. This can be changed in the serverless.yml file:
PGPASSWORD - /scout/{stage}/pgpassword
ESRISECRET - /interragroup/{stage}/esri-service-secret

The serverless-secrets plugin is utilized at runtime to provide decryption of secrets. For more information,
see the documentation: https://github.com/trek10inc/serverless-secrets

