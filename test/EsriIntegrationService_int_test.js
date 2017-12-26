'use strict';
const {expect} = require('chai');
const EsriIntegrationService = require('../src/EsriIntegrationService');

const {dbconnectionparams, esriserviceparams} = require('../src/connections');

const serviceurl = esriserviceparams.serviceurl;
const serviceparams = {
        url: esriserviceparams.serviceurl
};

const feedname = esriserviceparams.feedname;
const queryparams = {
    f: 'geojson',
    returnGeometry: true,
    geometryType: 'esriGeometryPoint',
    where: '1=1',
    outSR: '4326'
};

const authparams = {
    authenticationUrl: esriserviceparams.authenticationUrl,
    username: esriserviceparams.username,
    password: esriserviceparams.password
};

const invalidauthparams = {
    authenticationUrl: 'http://falsyincompleteurl/auth',
    invalidUsername: 'invaliduser',
    invalidPassword: 'wrongpassword'
}

describe('Esri Service Integration Tests', function() {
    describe('Call Sample Feature Service', function() {
        this.timeout(5000); //using an arrow function will break this.
        it('fails to query features with invalid authorization parameters', function() {
           let esrihelper = new EsriIntegrationService(authparams.authenticationUrl, invalidauthparams.username, invalidauthparams.password);
           return esrihelper.query(serviceurl, queryparams)
               .catch(error => {
                  expect(error).not.to.equal(null);
                  expect(error).not.to.have.property('features');
               });
        });
        it('fails to get auth token with invalid authenticationUrl', function() {
            let esrihelper = new EsriIntegrationService(invalidauthparams.authenticationUrl, authparams.username, authparams.password);
            return esrihelper.query(serviceurl, queryparams)
                .catch(error => {
                    expect(error).not.to.equal(null);
                    expect(error).not.to.have.property('features');
                });
        })
        it('Returns features', function() {
            let esrihelper = new EsriIntegrationService(authparams.authenticationUrl, authparams.username, authparams.password);
            return esrihelper.query(serviceurl, queryparams)
                .then((result) => {
                expect(result).to.be.an('object', 'result should be an object.');
                expect(result).to.have.property('features');
            });
        })
        it('fails to return features with invalid queryparams', function() {
            const queryparams = {
                f: 'somejson',
                returnGeometry: true,
                geometryType: 'esriGeometryPoint',
                where: '1=1',
                outSR: '4326'
            };
            let esrihelper = new EsriIntegrationService(authparams.authenticationUrl, authparams.username, authparams.password);
            return esrihelper.query(serviceurl, queryparams)
                    .catch(error => {
                        expect(error).not.to.equal(null);
                    })
        })
        it('fails to return features with invalid servicepararms', function() {
            const serviceurl = {
                serviceurl: 'http://falsyserviceurl/service/xyz',
                feedname: 'testfeed'
            }
            let esrihelper = new EsriIntegrationService(authparams.authenticationUrl, authparams.username, authparams.password);
            return esrihelper.query(serviceurl, queryparams)
                .catch(error => {
                    expect(error).not.to.equal(null);
                })
        })
    });
});