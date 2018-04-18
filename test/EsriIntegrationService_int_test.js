'use strict';
const {expect} = require('chai');
const EsriIntegrationService = require('../src/EsriIntegrationService');

const {esriserviceparams} = require('../src/connections');

const serviceurl = esriserviceparams.serviceurl;

const feedname = esriserviceparams.feedname;
const queryparams = {
    f: 'geojson',
    returnGeometry: true,
    geometryType: 'esriGeometryPoint',
    where: '1=1',
    outSR: '4326'
};

const authparams = esriserviceparams.authparams;

describe('Esri Service Integration Tests', function() {
    describe('Call Sample Feature Service', function() {
        this.timeout(5000); //using an arrow function will break this.
        it('fails to query features with invalid authorization parameters', function() {
           let invalidauthparams = {
               authenticationUrl: authparams.authenticationUrl,
               username: 'invaliduser',
               password: 'wrongpassword'
        }
           let esrihelper = new EsriIntegrationService(invalidauthparams);
           return esrihelper.query(serviceurl, queryparams)
               .catch(error => {
                  expect(error).not.to.equal(null);
                  expect(error).not.to.have.property('features');
               });
        });
        it('fails to get auth token with invalid authenticationUrl', function() {
            let invalidauthparams = {
                authenticationUrl: 'http://falsyincompleteurl/auth',
                username: 'invaliduser',
                password: 'wrongpassword'
            }
            let esrihelper = new EsriIntegrationService(invalidauthparams);
            return esrihelper.query(serviceurl, queryparams)
                .catch(error => {
                    expect(error).not.to.equal(null);
                    expect(error).not.to.have.property('features');
                });
        })
        it('Returns features and saves authtoken for next run', function() {
            let esrihelper = new EsriIntegrationService(authparams);
            return esrihelper.query(serviceurl, queryparams)
                .then((result) => {
                expect(result).to.be.an('object', 'result should be an object.');
                expect(result).to.have.property('features');
                console.log("here in the enterprise");
                expect(authparams.authtoken).to.be.string;
                expect(parseInt(authparams.authtokenexpiresat)).greaterThan(new Date().getTime());
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
            let esrihelper = new EsriIntegrationService(authparams);
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
            let esrihelper = new EsriIntegrationService(authparams);
            return esrihelper.query(serviceurl, queryparams)
                .catch(error => {
                    expect(error).not.to.equal(null);
                })
        })
    });
});