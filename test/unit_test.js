'use strict';
const expect = require('chai').expect;
const processor = require('../src/processor');
const esrihelper = require('../src/esrihelper');

describe('All Unit Tests', function() {
    describe('EsriHelper Module', function() {
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
        describe('etlesrifeatures', function() {
            it('Should be a function', function() {
                expect(processor.etlesrifeatures).to.be.a('function');
            });
        })
    })
});