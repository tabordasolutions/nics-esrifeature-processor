'use strict';
const expect = require('chai').expect;
const FeatureProcessorDAO = require('../src/FeatureProcessorDAO');
const { Client } = require('pg');
let sinon = require('sinon');

const dbparams = {
    host: 'host',
    port: '5432',
    user: 'usr',
    password: 'pwd',
    database: 'db'
};
const feedname = "test feed";
const features = [{"type":"Feature","id":1,"geometry":{"type":"Point","coordinates":[-122.09999999999997,36.900000000000034]},"properties":{"Row_ID":1,"Unit_ID":"2B7","Unit_Status_Desc":"LOGOFF","Unit_Status_Code":"08LF","StatusTime":1505246530000,"Inc_ID":"","Inc_Address":"","CAD_Pri_Desc":"","LastUpdate":null,"Direction":null,"Speed":null,"GPSStatus":0,"Unit_Type":null,"CurrentStation":null,"Station":null,"Agency":"SCCFD","UnitStatus":"UNAVAIL","CAD_Pri_Code":0,"TrackingID":null,"CoordX":null,"CoordY":null,"Latitude":36.9,"Longitude":-122.1,"DisplayOrder":10}},{"type":"Feature","id":2,"geometry":{"type":"Point","coordinates":[-122.09999999999997,36.900000000000034]},"properties":{"Row_ID":2,"Unit_ID":"2B8","Unit_Status_Desc":"LOGOFF","Unit_Status_Code":"08LF","StatusTime":1501011649000,"Inc_ID":"","Inc_Address":"","CAD_Pri_Desc":"","LastUpdate":null,"Direction":null,"Speed":null,"GPSStatus":0,"Unit_Type":null,"CurrentStation":null,"Station":null,"Agency":"SCCFD","UnitStatus":"UNAVAIL","CAD_Pri_Code":0,"TrackingID":null,"CoordX":null,"CoordY":null,"Latitude":36.9,"Longitude":-122.1,"DisplayOrder":10}}];

let upsertrecord_querytext = 'Select upsert_geojson_point_record($1, $2, $3, $4, $5)';

describe('FeatureProcessorDAO', (done) => {

    it('Given no features, no db operations are performed', () => {
        const features = [];
        let spy = sinon.spy();
        let featureProcessorDAO = new FeatureProcessorDAO(dbparams, spy);
        featureProcessorDAO.upsertFeatures(feedname, features)
            .then(result => {
                expect(result).to.not.be.null;
                expect(spy.called).to.be.false;
            })
            .then(done, done);
    });

    describe('fails to connect to db', (done) => {
        let failingClient = {
            connect: function (callback) {
                let err = {message: 'failed to connect to fake db'};
                callback(err);
            }
        }
        let featureProcessorDAO = new FeatureProcessorDAO(dbparams, failingClient);

        it('query invokes geoservices auth & service methods', () => {
            featureProcessorDAO.upsertFeatures(feedname, features)
                .then(result => {expect(false).to.be.true})
                .catch(error => {
                    console.log("error: " + error);
                    expect(error).to.not.be.null})
                .then(done, done);
        });
    });

    describe('fails on', (done) => {

        it('failure to begin transaction', () => {
            let fakeClient = {
                connect: function (callback) {
                    callback();
                },
                query: function(text, array) { return new Promise((resolves, rejects) => {return text == 'query' ? rejects("failing begin") : resolves(1);})},
                end: sinon.stub(),
            };
            let spyConnect = sinon.spy(fakeClient, 'connect');
            let spyQuery = sinon.spy(fakeClient, 'query');
            let stubEnd = fakeClient.end;
            stubEnd.resolves(1);
            new FeatureProcessorDAO(dbparams, fakeClient).upsertFeatures(feedname, features)
                .then(result => {
                    console.log('supposed to fail');
                    expect(false).to.be.true;
                })
                .catch((error) => {
                    expect(error).to.equal('failing begin');
                    sinon.assert.calledOnce(spyConnect);
                    sinon.assert.calledWith(spyQuery, 'BEGIN');
                    sinon.assert.neverCalledWith(spyQuery, 'COMMIT');
                    sinon.assert.calledWith(spyQuery, upsertrecord_querytext, sinon.match.string);
                    expect(stubEnd.called).to.be.true;
                })
                .then(done, done);
        });

        it('failure to update features', (done) => {
            let fakeClient = {
                connect: function (callback) {
                    callback();
                },
                query: function (text, array) {
                    return new Promise((resolves, rejects) => {
                        return rejects("failing begin");
                    })
                },
                end: sinon.stub(),
            };
            let spyConnect = sinon.spy(fakeClient, 'connect');
            let spyQuery = sinon.spy(fakeClient, 'query');
            let stubEnd = fakeClient.end;
            stubEnd.resolves(1);
            new FeatureProcessorDAO(dbparams, fakeClient).upsertFeatures(feedname, features)
                .then(result => {
                    console.log('supposed to fail');
                    expect(false).to.be.true;
                })
                .catch((error) => {
                    expect(error).to.equal('failing begin');
                    sinon.assert.calledOnce(spyConnect);
                    sinon.assert.calledWith(spyQuery, 'BEGIN');
                    sinon.assert.neverCalledWith(spyQuery, 'COMMIT');
                    sinon.assert.neverCalledWith(spyQuery, upsertrecord_querytext, sinon.match.string);
                    expect(stubEnd.called).to.be.true;
                })
                .then(done, done);
        });
    });

    describe('successfully insert/updates records into db', (done) => {
        let fakeClient = {
            connect: function (callback) {
                callback();
            },
            query: function(text, array) { return new Promise((resolves, rejects) => {return resolves(1);})},
            end: function() { return new Promise((resolves, rejects) => {return resolves(1);})},
        };
        let featureProcessorDAO = new FeatureProcessorDAO(dbparams, fakeClient);

        it('persists features successfully', (done) => {
            let spyConnect = sinon.spy(fakeClient, 'connect');
            let spyQuery = sinon.spy(fakeClient, 'query');
            let spyEnd = sinon.spy(fakeClient.end);

            featureProcessorDAO.upsertFeatures(feedname, features)
                 .then(result => {
                     expect(result).to.not.be.null;
                     expect(result.timestamp).to.not.be.null;
                     expect(spyConnect.calledOnce).to.be.true;
                     expect(spyQuery.calledWith('BEGIN')).to.be.true;
                     expect(spyQuery.withArgs(upsertrecord_querytext, sinon.match.array).callCount).to.equal(features.length);
                     expect(spyQuery.calledWith('COMMIT')).to.be.true;
                     expect(spyQuery.callCount).to.equal(4);
                     expect(spyEnd.called).to.be.false;
                 })
                .catch((e) => {
                    console.log('supposed to succeed', e);
                    throw new Error('supposed to succeed', e);
                })
                .then(done, done);
        });
    });
});