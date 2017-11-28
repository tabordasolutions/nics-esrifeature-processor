'use strict';
const {expect} = require('chai');
const processor = require('../src/processor');
const esrihelper = require('../src/esrihelper');

const {dbconnectionparams, esriserviceparams} = require('../src/connections');

const serviceparams = {
        url: esriserviceparams.serviceurl
};

const feedname = esriserviceparams.feedname;
const query_params = {
    f: 'geojson',
    returnGeometry: true,
    geometryType: 'esriGeometryPoint',
    where: '1=1',
    outSR: '4326'
};

const authorization = {
    authenticationUrl: esriserviceparams.authenticationUrl,
    username: esriserviceparams.username,
    password: esriserviceparams.password
};

describe('Integration Tests', function() {
    describe('Call Sample Feature Service', function() {
        this.timeout(5000); //using an arrow function will break this.
        it('Gets an Auth token',() => {
            return esrihelper.getAuthToken(authorization.authenticationUrl,authorization.username,authorization.password)
                .then((result) => {
                    expect(result).to.be.an('object', 'result should be an object.');
                    expect(result).to.have.property('token');
                });
        });
        it('Returns features', function() {
            return esrihelper.query(serviceparams,query_params,authorization)
                .then((result) => expect(result).to.be.an('object', 'result should be an object.'));
        });
        it('Processes features', function() {
         return esrihelper.query(serviceparams,query_params,authorization)
             .then((result) => {
                 expect(result).to.be.an('object', 'result should be an object.');
                 expect(result).to.have.property('features');
                 expect(result.features).to.be.an('array');
                 return processor.etlesrifeatures(feedname,result.features,dbconnectionparams);
            })
             .catch((error) => expect.fail(error,null, `${error}`,'==='));
        });
    });
});
