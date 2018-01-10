'use strict';
const expect = require('chai').expect;
let sinon = require('sinon');
let FeatureProcessor = require('../src/FeatureProcessor');
let secretsclient = require('serverless-secrets/client');

describe('lambda', () => {
    let {feedname, dbconnectionparams, esriserviceparams} = require('../src/connections');

    describe('runs successfully', () => {
        let secretClientMock, secretPromise, featureprocessorstub, promiseresolves;
        beforeEach(() => {
            secretClientMock = sinon.mock(secretsclient);
            secretPromise = Promise.resolve(1);
            featureprocessorstub = sinon.mock(FeatureProcessor.prototype);
            promiseresolves = new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve('successful');
                }, 100);
            });
            featureprocessorstub.expects('etlesrifeatures').returns(promiseresolves);
        });

        afterEach(() => {
            secretClientMock.restore();
            featureprocessorstub.restore();
        });

        it('without decrypting secrets', (done) => {
            dbconnectionparams.passworddecrypted = true;
            esriserviceparams.passworddecrypted = true;
            secretClientMock.expects('load').never();
            let lambda = require('../lambda');

            lambda.handler();

            promiseresolves
                .then(result => {
                    secretClientMock.verify();
                    featureprocessorstub.verify();
                })
                .then(done, done);
        });

        it('decrypting secrets', (done) => {
            dbconnectionparams.passworddecrypted = false;
            esriserviceparams.passworddecrypted = false;
            secretClientMock.expects('load').once().returns(secretPromise);
            let lambda = require('../lambda');

            lambda.handler();
            promiseresolves
                .then(result => {
                    secretClientMock.verify();
                    featureprocessorstub.verify();

                })
                .then(done, done);
        });
    });

    it('fails to decrypt passwords', (done) => {
        let secretClientMock = sinon.mock(secretsclient);
        let secretDecryptionRejectedPromise = Promise.reject(new Error('fake error decrypting secrets'));
        let featureprocessorstub = sinon.mock(FeatureProcessor.prototype);
        secretClientMock.expects('load').returns(secretDecryptionRejectedPromise);
        featureprocessorstub.expects('etlesrifeatures').never();
        let lambda = require('../lambda');

        lambda.handler();
        secretDecryptionRejectedPromise
            .catch(result => {
                secretClientMock.verify();
                featureprocessorstub.verify();

            })
            .then(done, done);
    });

    it('fails to etl features', (done) => {
        let secretClientMock = sinon.mock(secretsclient);
        let secretDecryptionPromise = Promise.resolve(1);
        let etlFeaturesRejectedPromise = new Promise((resolves, rejects) => {
            setTimeout(() => {
                rejects(new Error('fake error'));
            }, 100);
        });
        let featureprocessorstub = sinon.mock(FeatureProcessor.prototype);
        secretClientMock.expects('load').once().returns(secretDecryptionPromise);
        featureprocessorstub.expects('etlesrifeatures').once().returns(etlFeaturesRejectedPromise);

        let lambda = require('../lambda');

        lambda.handler();
        etlFeaturesRejectedPromise
            .catch(result => {
                secretClientMock.verify();
                featureprocessorstub.verify();

            })
            .then(done, done);
    });
});