//This will be the module for running under lambda
const FeatureProcessor = require('./src/FeatureProcessor');
const secretsPromise = require('serverless-secrets/client').load();

let {feedname, dbconnectionparams, esriserviceparams} = require('./src/connections');

let handler = function(event, context, callback) {
    console.log(`Starting ETL process for feed ${feedname}`);
    let promise;
    if(!dbconnectionparams.passworddecrypted || !esriserviceparams.passworddecrypted) {
        console.log('Decrypting secrets');
        promise = decryptSecrets(dbconnectionparams, esriserviceparams);
    } else {
        console.log('No secrets to decrypt');
        promise = Promise.resolve('No secrets to decrypt');
    }

    promise.then(result => {
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
    return secretsPromise.then(() => {
        dbconnectionparams.password = process.env.PGPASSWORD;
        dbconnectionparams.passworddecrypted = true;
        esriserviceparams.password = process.env.ESRISECRET;
        esriserviceparams.passworddecrypted = true;
        console.log(`Secrets Decrypted.`);
        return 'Secrets decrypted';
    });
};

module.exports = exports = {
    handler: handler
}
