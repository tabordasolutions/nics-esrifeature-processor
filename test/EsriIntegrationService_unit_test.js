'use strict';
const {expect} = require('chai');
const sinon = require('sinon');
const EsriIntegrationService = require('../src/EsriIntegrationService');

describe('Esri Service Unit Tests', function() {
    let geoservicesClient;
    let featureServiceStub;
    let authenticateStub;
    let fakeFeatureServiceQuery;
    let fakeFeatureServiceQuerySpy;
    let esriIntegrationService;

    let authparams = {
        secureService: false,
        username: 'usr',
        password: 'pwd',
        passwordecrypted: false
    };
    let queryparams = {
        f: 'geojson',
        returnGeometry: true,
        geometryType: 'esriGeometryPoint',
        where: '1=1',
        outSR: '4326'
    };
    let authenticationUrl = 'http://testtabordasolutions.com/auth';
    let serviceUrl = 'http://testtabordasolutions.com/service';
    let featureGSON = {"type":"FeatureCollection","crs":{"type":"name","properties":{"name":"EPSG:4326"}},"features":
        [{"type":"Feature","id":1,"geometry":{"type":"Point","coordinates":[-122.09999999999997,36.900000000000034]},"properties":{"Row_ID":1,"Unit_ID":"2B7","Unit_Status_Desc":"LOGOFF","Unit_Status_Code":"08LF","StatusTime":1505246530000,"Inc_ID":"","Inc_Address":"","CAD_Pri_Desc":"","LastUpdate":null,"Direction":null,"Speed":null,"GPSStatus":0,"Unit_Type":null,"CurrentStation":null,"Station":null,"Agency":"SCCFD","UnitStatus":"UNAVAIL","CAD_Pri_Code":0,"TrackingID":null,"CoordX":null,"CoordY":null,"Latitude":36.9,"Longitude":-122.1,"DisplayOrder":10}},{"type":"Feature","id":2,"geometry":{"type":"Point","coordinates":[-122.09999999999997,36.900000000000034]},"properties":{"Row_ID":2,"Unit_ID":"2B8","Unit_Status_Desc":"LOGOFF","Unit_Status_Code":"08LF","StatusTime":1501011649000,"Inc_ID":"","Inc_Address":"","CAD_Pri_Desc":"","LastUpdate":null,"Direction":null,"Speed":null,"GPSStatus":0,"Unit_Type":null,"CurrentStation":null,"Station":null,"Agency":"SCCFD","UnitStatus":"UNAVAIL","CAD_Pri_Code":0,"TrackingID":null,"CoordX":null,"CoordY":null,"Latitude":36.9,"Longitude":-122.1,"DisplayOrder":10}}]
    };

    beforeEach(() => {
        let authoptions = {
            authenticationUrl
        };
        fakeFeatureServiceQuery = {query: function(query_params, callback) {
            return callback(null, featureGSON);
        }};
        fakeFeatureServiceQuerySpy = sinon.spy(fakeFeatureServiceQuery, 'query');
        featureServiceStub = sinon.stub();
        authenticateStub = sinon.stub();
        geoservicesClient = {featureservice: featureServiceStub, authenticate: authenticateStub};
    })

    it('no token is generated when querying unsecured service', function(done) {
        featureServiceStub.withArgs(sinon.match({url: serviceUrl})).returns(fakeFeatureServiceQuery);
        fakeFeatureServiceQuerySpy.withArgs(sinon.match(queryparams));
        esriIntegrationService = new EsriIntegrationService(authparams, geoservicesClient);
        esriIntegrationService.query(serviceUrl, queryparams)
            .then(result => {
                expect(authenticateStub.called).to.be.false;
                expect(featureServiceStub.calledOnce).to.be.true;
                expect(fakeFeatureServiceQuerySpy.calledOnce).to.be.true;
            })
            .then(done, done);
    })

    it('token is generated & used to query secured service', function(done) {
        let authparamsSecuredService = Object.assign(authparams, {secureService: true});
        console.log('secureservice auth params: ' + JSON.stringify(authparamsSecuredService));
        authenticateStub
             .withArgs(sinon.match.any,//(authparamsSecuredService.username),
                 sinon.match.any,//(authparamsSecuredService.password),
                 sinon.match.any,//({expiration: authparamsSecuredService.expireauthtokeninminutes, client: authparamsSecuredService.client}),
                 sinon.match.any)
            .callsArgWith(3, null, {token: 'faketoken'});
        fakeFeatureServiceQuerySpy.withArgs(sinon.match(Object.assign({token: 'faketoken'}, queryparams)));
        featureServiceStub.withArgs(sinon.match({url: serviceUrl})).returns(fakeFeatureServiceQuery);
        esriIntegrationService = new EsriIntegrationService(authparamsSecuredService, geoservicesClient);
        esriIntegrationService.query(serviceUrl, queryparams)
            .then(result => {
                expect(authenticateStub.calledOnce).to.be.true;
                expect(featureServiceStub.calledOnce).to.be.true;
                expect(fakeFeatureServiceQuerySpy.calledOnce).to.be.true;
            })
            .then(done, done);
    })
});