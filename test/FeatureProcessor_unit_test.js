const {expect} = require('chai');
let sinon = require('sinon');
let moment = require('moment');
let FeatureProcessor = require('../src/FeatureProcessor');
let EsriIntegrationService = require('../src/EsriIntegrationService');
let FeatureProcessorDAO = require('../src/FeatureProcessorDAO');

const dbconnectionparams = {host: 'localhost',
    port: '5432',
    user: 'invaliduser',
    password: 'invalidpassword',
    database: 'nics.datafeeds',
    passworddecrypted: true
};

const esriconnectionparams = {
    authenticationUrl: 'http://fakehost/url/token',
    serviceurl: 'http://fakehost/url/service',
    queryparams : {
        f: 'geojson',
        returnGeometry: true,
        geometryType: 'esriGeometryPoint',
        where: '1=1',
        outSR: '4326'
    },
    authparams: {
        username: 'usr',
        password: 'pwd',
        passwordecrypted: false,
    },
    staleDataAfterDays: 7
};

const feedname = 'test-feed';

let featuresGSON = {"type":"FeatureCollection","crs":{"type":"name","properties":{"name":"EPSG:4326"}},"features":
    [{"type":"Feature","id":1,"geometry":{"type":"Point","coordinates":[-122.09999999999997,36.900000000000034]},"properties":{"Row_ID":1,"Unit_ID":"2B7","Unit_Status_Desc":"LOGOFF","Unit_Status_Code":"08LF","StatusTime":1505246530000,"Inc_ID":"","Inc_Address":"","CAD_Pri_Desc":"","LastUpdate":null,"Direction":null,"Speed":null,"GPSStatus":0,"Unit_Type":null,"CurrentStation":null,"Station":null,"Agency":"SCCFD","UnitStatus":"UNAVAIL","CAD_Pri_Code":0,"TrackingID":null,"CoordX":null,"CoordY":null,"Latitude":36.9,"Longitude":-122.1,"DisplayOrder":10}},{"type":"Feature","id":2,"geometry":{"type":"Point","coordinates":[-122.09999999999997,36.900000000000034]},"properties":{"Row_ID":2,"Unit_ID":"2B8","Unit_Status_Desc":"LOGOFF","Unit_Status_Code":"08LF","StatusTime":1501011649000,"Inc_ID":"","Inc_Address":"","CAD_Pri_Desc":"","LastUpdate":null,"Direction":null,"Speed":null,"GPSStatus":0,"Unit_Type":null,"CurrentStation":null,"Station":null,"Agency":"SCCFD","UnitStatus":"UNAVAIL","CAD_Pri_Code":0,"TrackingID":null,"CoordX":null,"CoordY":null,"Latitude":36.9,"Longitude":-122.1,"DisplayOrder":10}}]
};

describe('Feature Processor', () => {
    let querystub;
    let daoupsertfeaturesstub;
    let daoprunestaledatastub;
    let featureProcessor;

    beforeEach(function() {
        querystub = sinon.stub(EsriIntegrationService.prototype, 'query');
        daoupsertfeaturesstub = sinon.stub(FeatureProcessorDAO.prototype, 'upsertFeatures');
        daoprunestaledatastub = sinon.stub(FeatureProcessorDAO.prototype, 'deleteRecordsBefore');
        featureProcessor = new FeatureProcessor(feedname, esriconnectionparams, dbconnectionparams);
    });

    afterEach(function() {
        querystub.restore();
        daoupsertfeaturesstub.restore();
        daoprunestaledatastub.restore();
    });

    it('completes features ETL successfully', function(done) {
        querystub.withArgs(esriconnectionparams.serviceurl, esriconnectionparams.queryparams).resolves(featuresGSON);
        let AsOfDateLocalTZ = moment().tz("US/Pacific").format();
        daoupsertfeaturesstub.withArgs(feedname, featuresGSON.features).returns({timestamp: AsOfDateLocalTZ});
        daoprunestaledatastub.withArgs(moment(AsOfDateLocalTZ).subtract(esriconnectionparams.staleDataAfterDays, 'days')).resolves();

        featureProcessor.etlesrifeatures()
            .then(result => {
                expect(querystub.calledOnce).to.be.true;
                expect(daoupsertfeaturesstub.calledOnce).to.be.true;
                expect(daoprunestaledatastub.calledOnce).to.be.true;
            })
            .then(done, done);
    });

    it('failure to retrieve features from ESRI fails the ETL', function(done) {
        querystub.withArgs(esriconnectionparams.serviceurl, esriconnectionparams.queryparams).rejects(new Error('Fake error getting features'));
        featureProcessor.etlesrifeatures()
            .then(result => {
                throw new Error('Supposed to fail');
            })
            .catch(error => {
                expect(querystub.called).to.be.true;
                expect(daoupsertfeaturesstub.called).to.be.false;
                expect(daoprunestaledatastub.called).to.be.false;
            })
            .then(done, done);
    });

    it('invalid features fail to persist in db', function(done) {
        let invalidfeatures = {"type":"FeatureCollection","crs":{"type":"name","properties":{"name":"EPSG:4326"}},"features":
            [{"type":"Feature","id":1,"geometry":{"type":"Some","coordinates":[-122.09999999999997,36.900000000000034]},"properties":{"Row_ID":1,"Unit_ID":"2B7","Unit_Status_Desc":"LOGOFF","Unit_Status_Code":"08LF","StatusTime":1505246530000,"Inc_ID":"","Inc_Address":"","CAD_Pri_Desc":"","LastUpdate":null,"Direction":null,"Speed":null,"GPSStatus":0,"Unit_Type":null,"CurrentStation":null,"Station":null,"Agency":"SCCFD","UnitStatus":"UNAVAIL","CAD_Pri_Code":0,"TrackingID":null,"CoordX":null,"CoordY":null,"Latitude":36.9,"Longitude":-122.1,"DisplayOrder":10}},
             {"type":"FeatureInvalidType","id":2,"geometry":{"type":"Point","coordinates":[-122.09999999999997,36.900000000000034]},"properties":{"Row_ID":2,"Unit_ID":"2B8","Unit_Status_Desc":"LOGOFF","Unit_Status_Code":"08LF","StatusTime":1501011649000,"Inc_ID":"","Inc_Address":"","CAD_Pri_Desc":"","LastUpdate":null,"Direction":null,"Speed":null,"GPSStatus":0,"Unit_Type":null,"CurrentStation":null,"Station":null,"Agency":"SCCFD","UnitStatus":"UNAVAIL","CAD_Pri_Code":0,"TrackingID":null,"CoordX":null,"CoordY":null,"Latitude":36.9,"Longitude":-122.1,"DisplayOrder":10}},
             {"type":"FeatureInvalidType","id":2,"geometry":{"type":"Point","coordinates":[-122.09999999999997,36.900000000000034]}}
            ]
        };
        querystub.withArgs(esriconnectionparams.serviceurl, esriconnectionparams.queryparams).resolves(invalidfeatures);
        let AsOfDateLocalTZ = moment().tz("US/Pacific").format();
        daoupsertfeaturesstub.withArgs(feedname, []).returns({timestamp: AsOfDateLocalTZ});
        daoprunestaledatastub.withArgs(moment(AsOfDateLocalTZ).subtract(esriconnectionparams.staleDataAfterDays, 'days')).resolves();

        featureProcessor.etlesrifeatures()
            .then(result => {
                expect(querystub.calledOnce).to.be.true;
                expect(daoupsertfeaturesstub.calledOnce).to.be.true;
                expect(daoprunestaledatastub.calledOnce).to.be.true;
            })
            .then(done, done);
    });

    it('failure to persist the features in db fails the ETL', function(done) {
        querystub.withArgs(esriconnectionparams.serviceurl, esriconnectionparams.queryparams).resolves(featuresGSON);
        let errormessage = 'failed to persist features';
        daoupsertfeaturesstub.withArgs(feedname, featuresGSON.features).rejects(new Error(errormessage));
        featureProcessor.etlesrifeatures()
            .then(result => {
                throw new Error('Supposed to fail');
            })
            .catch(error => {
                expect(error.message).to.equal(errormessage);
                expect(querystub.calledOnce).to.be.true;
                expect(daoupsertfeaturesstub.calledOnce).to.be.true;
                expect(daoprunestaledatastub.called).to.be.false;
            })
            .then(done, done);
    });

    it('failure to prune old data fails ETL', function(done) {
        querystub.withArgs(esriconnectionparams.serviceurl, esriconnectionparams.queryparams).resolves(featuresGSON);
        let AsOfDateLocalTZ = moment().tz("US/Pacific").format();
        daoupsertfeaturesstub.withArgs(feedname, featuresGSON.features).returns({timestamp: AsOfDateLocalTZ});
        let errormessage = 'failed to prune old records';
        daoprunestaledatastub.withArgs(moment(AsOfDateLocalTZ).subtract(esriconnectionparams.staleDataAfterDays, 'days')).rejects(new Error(errormessage));

        featureProcessor.etlesrifeatures()
            .then(result => {
                throw new Error('Supposed to fail');
            })
            .catch(error => {
                expect(error.message).to.equal(errormessage);
                expect(querystub.calledOnce).to.be.true;
                expect(daoupsertfeaturesstub.calledOnce).to.be.true;
                expect(daoprunestaledatastub.called).to.be.true;
            })
            .then(done, done);
    });

    it('given featuretransformer persists transformed features into db', function(done) {
       let featuretransformer = function(features = []) {
           let transformedfeatures = features.map(feature => {
               let transformedFeature = JSON.parse(JSON.stringify( feature ));
               let speed = feature.properties.Speed;
               speed = speed ? speed : '0';
               transformedFeature.properties.Speed = `${speed} Knots`;

               let direction = feature.properties.Direction;
               direction = direction ? direction : '0';
               transformedFeature.properties.Direction = `${direction} &deg;`;
               return transformedFeature;
           });
           return transformedfeatures;
       };

       let transformedfeatures = featuretransformer(featuresGSON.features);
       querystub.withArgs(esriconnectionparams.serviceurl, esriconnectionparams.queryparams).resolves(featuresGSON);
       let AsOfDateLocalTZ = moment().tz("US/Pacific").format();
       daoupsertfeaturesstub.withArgs(feedname, transformedfeatures).returns({timestamp: AsOfDateLocalTZ});
       let errormessage = 'failed to prune old records';
       daoprunestaledatastub.withArgs(moment(AsOfDateLocalTZ).subtract(esriconnectionparams.staleDataAfterDays, 'days')).resolves();

       featureProcessor.etlesrifeatures(featuretransformer)
           .then(result => {
               expect(querystub.calledOnce).to.be.true;
               expect(daoupsertfeaturesstub.calledOnce).to.be.true;
               expect(daoprunestaledatastub.calledOnce).to.be.true;
           })
           .then(done, done);
    });
});