const esrihelper = require('./esrihelper');
const db = require('./db');
let moment = require('moment');

let etlesrifeatures = function(feedname, esriserviceparams, dbconnectionparams, featureTransformer) {
    return esrihelper.query(esriserviceparams.serviceurl, esriserviceparams.queryparams, esriserviceparams.authenticationUrl, esriserviceparams.username, esriserviceparams.password)
            .then(result => {return getFeatureTransformerPromise(featureTransformer, result.features)})
            .then(transformedResult => {return db.upsertdb(feedname, transformedResult, dbconnectionparams)})
            .then(result => {return prunestaledata(moment(result.timestamp).subtract(esriserviceparams.daysofstaledata, 'days'), feedname, dbconnectionparams)});
}

let getFeatureTransformerPromise = (featureTransformer, result) => {
    if(!featureTransformer) {
        return Promise.resolve(result);
    } else if(Promise.isPromise(featureTransformer)) {
        return featureTransformer(result);
    } else {
        return Promise.resolve(featureTransformer(result));
    }
}

let prunestaledata = (olderthan = moment().subtract(30,'days'), feedname, dboptions = dbconnectionparams) => {
    return db.deleteRecordsBefore(olderthan, feedname, dboptions)
};

module.exports = exports = {
    etlesrifeatures: etlesrifeatures,
    prunestaledata : prunestaledata
};