const EsriIntegrationService = require('./EsriIntegrationService');
const FeatureProcessorDAO = require('./FeatureProcessorDAO');
let moment = require('moment');

function FeatureProcessor(feedname, esriserviceparams, dbconnectionparams) {
    this.feedname = feedname;
    this.esriserviceparams = esriserviceparams;
    this.dbconnectionparams = dbconnectionparams;
    this.featureProcessorDAO = new FeatureProcessorDAO(connectionparams = this.dbconnectionparams);
    this.esrihelper = new EsriIntegrationService(esriserviceparams.authenticationUrl, esriserviceparams.username, esriserviceparams.password);
}

FeatureProcessor.prototype.etlesrifeatures = function(featureTransformer) {
    return this.esrihelper.query(this.esriserviceparams.serviceurl, this.esriserviceparams.queryparams)
            .then(result => {return getFeatureTransformerPromise(featureTransformer, result.features)})
            .then(transformedFeatures => {return pruneInvalidfFeatures(transformedFeatures)})
            .then(prunedFeatures => {return this.featureProcessorDAO.upsertFeatures(this.feedname, prunedFeatures)})
            .then(result => {return this.prunestaledata(moment(result.timestamp).subtract(this.esriserviceparams.staleDataAfterDays, 'days'), this.feedname)});
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

let pruneInvalidfFeatures = function(features) {
    let validfeatures = features.filter((feature) => {
        return (feature.type === 'Feature' && feature.geometry.type === 'Point' && feature.properties !== null)
    });
    console.log(`Total # of features: ${features.length}, Valid # of features: ${validfeatures.length}`);
    return validfeatures;
};

FeatureProcessor.prototype.prunestaledata = function(olderthan = moment().subtract(30,'days'), feedname) {
    console.log('About to prune old records.');
    return this.featureProcessorDAO.deleteRecordsBefore(olderthan, feedname)
};

module.exports = exports = FeatureProcessor;