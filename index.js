//This will be the main module for running under node

let esrihelper = require('./src/esrihelper');
let processor = require('./src/processor');

let {feedname, dbconnectionparams, esriserviceparams} = require('./src/connections');

dbconnectionparams.passworddecrypted = true;
esriserviceparams.passworddecrypted = true;

processor.etlesrifeatures(feedname, esriserviceparams, dbconnectionparams)
    .then(result => console.log(result + 'Done.'))
    .catch(e => {
        console.error("Error during processing: ", e);
        process.exit(1);
    });