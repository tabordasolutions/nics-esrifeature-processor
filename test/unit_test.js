'use strict';
const expect = require('chai').expect;
const FeatureProcessor = require('../src/FeatureProcessor');
const EsriIntegrationService = require('../src/EsriIntegrationService');

const dbconnectionparams = {
    host: 'host',
    port: '5432',
    user: 'usr',
    password: 'pwd',
    database: 'db'
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
    username: 'usr',
    password: 'pwd',
    passwordecrypted: false,
    staleDataAfterDays: 7
}

describe('All Unit Tests', function() {
    describe('EsriHelper Module', function() {
        let esrihelper = new EsriIntegrationService();
        describe('getAuthToken', function() {
            it('Should be a function', function() {
                expect(esrihelper.getAuthToken).to.be.a('function');
            });
        });
        describe('query', () => {
            it('Should be a function', function() {
                expect(esrihelper.query).to.be.a('function');
            })
        });

    });
    describe('Processor Module', function() {
        let processor = new FeatureProcessor('test feed', dbconnectionparams, esriconnectionparams);
        describe('etlesrifeatures', function() {
            it('Should be a function', function() {
                expect(processor.etlesrifeatures).to.be.a('function');
            });
        })
    })
});