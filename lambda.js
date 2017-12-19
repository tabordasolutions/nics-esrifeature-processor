//This will be the module for running under lambda
const esrihelper = require('./src/esrihelper');
const processor = require('./src/processor');
const secretsPromise = require('serverless-secrets/client').load();

let {feedname, dbconnectionparams, esriserviceparams} = require('./src/connections');

let handler = function(event, context, callback) {
    console.log(`Starting ETL process for feed ${feedname}`);
    let promise;
    if(!dbconnectionparams.passworddecrypted || !esriserviceparams.tokendecrypted) {
        console.log('Decrypting secrets');
        promise = decryptSecrets(dbconnectionparams, esriserviceparams);
    } else {
        console.trace('No secrets to decrypt');
        promise = Promise.resolve('No secrets to decrypt');
    }
    promise.then(result => processor.etlesrifeatures(feedname, esriserviceparams, dbconnectionparams))
        .then( result => console.log(`ETL process for result ${result} completed successfully.`) )
        .catch(error => {
            console.error(`Error processing ${feedname} AVL ESRI data`, error);
            callback(e);
        });
}

let decryptSecrets = function(dbconnectionparams, esriserviceparams) {
    return secretsPromise.then(() => {
        dbconnectionparams.password = process.env.PGPASSWORD;
        dbconnectionparams.passworddecrypted = true;
        esriserviceparams.password = process.env.ESRISECRET;
        esriserviceparams.passworddecrypted = true;
        return 'Secrets decrypted';
    });
};

module.exports = exports = {
    handler: handler
}