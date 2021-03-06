//This will be the module for running under lambda
const FeatureProcessor = require('./src/FeatureProcessor');
var AWSXRay = require('aws-xray-sdk-core');
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
let {feedname, dbconnectionparams, esriserviceparams} = require('./src/connections');

let handler = function(event, context, callback) {
    console.log(`Starting ETL process for feed ${feedname}`);
    let promise;

    if(dbconnectionparams.passworddecrypted && esriserviceparams.authparams.passworddecrypted) {
         promise = Promise.resolve('No secrets to decrypt');
    } else {
        promise = decryptSecrets(dbconnectionparams, esriserviceparams);
    }

    promise.then(result => {
        console.log(result);
        let processor = new FeatureProcessor(feedname, esriserviceparams, dbconnectionparams);
        return processor.etlesrifeatures();
    })
        .then( result => console.log(`ETL process for ${feedname} completed successfully.`) )
        .catch(error => {
            console.error(`Error processing ${feedname} AVL ESRI data`, error);
            if(callback)
                callback(error);
        });
}

let decryptSecrets = function(dbconnectionparams, esriserviceparams) {
    let secretsPromise = require('serverless-secrets/client').load();
    return secretsPromise.then(() => {
        dbconnectionparams.password = process.env.PGPASSWORD;
        dbconnectionparams.passworddecrypted = true;
        esriserviceparams.authparams.password = process.env.ESRISECRET;
        esriserviceparams.authparams.passworddecrypted = true;
        return 'Secrets decrypted';
    });
};

module.exports = exports = {
    handler: handler
}