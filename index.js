//This will be the main module for running under node

let FeatureProcessor = require('./src/FeatureProcessor');
let moment = require('moment');

let {feedname, dbconnectionparams, esriserviceparams} = require('./src/connections');

dbconnectionparams.passworddecrypted = true;
esriserviceparams.passworddecrypted = true;

let processor = new FeatureProcessor(feedname, esriserviceparams, dbconnectionparams);
console.log(`Starting ${feedname} ETL at ${moment().tz("US/Pacific").format()}`);
processor.etlesrifeatures()
    .then(result => console.log('Done.'))
    .catch(error => {
        console.error("Error during processing: ", error);
        process.exit(1);
    });