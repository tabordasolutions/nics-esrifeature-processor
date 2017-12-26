//This will be the main module for running under node

let FeatureProcessor = require('./src/FeatureProcessor');

let {feedname, dbconnectionparams, esriserviceparams} = require('./src/connections');

dbconnectionparams.passworddecrypted = true;
esriserviceparams.passworddecrypted = true;

let processor = new FeatureProcessor(feedname, esriserviceparams, dbconnectionparams);
processor.etlesrifeatures()
    .then(result => console.log(result + 'Done.'))
    .catch(e => {
        console.error("Error during processing: ", e);
        process.exit(1);
    });