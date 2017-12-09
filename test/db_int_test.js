'use strict';
const {expect} = require('chai');
const db = require('../src/db');

const {dbconnectionparams, esriserviceparams} = require('../src/connections');

const features = [{"type":"Feature","id":1,"geometry":{"type":"Point","coordinates":[-122.09999999999997,36.900000000000034]},"properties":{"Row_ID":1,"Unit_ID":"2B7","Unit_Status_Desc":"LOGOFF","Unit_Status_Code":"08LF","StatusTime":1505246530000,"Inc_ID":"","Inc_Address":"","CAD_Pri_Desc":"","LastUpdate":null,"Direction":null,"Speed":null,"GPSStatus":0,"Unit_Type":null,"CurrentStation":null,"Station":null,"Agency":"SCCFD","UnitStatus":"UNAVAIL","CAD_Pri_Code":0,"TrackingID":null,"CoordX":null,"CoordY":null,"Latitude":36.9,"Longitude":-122.1,"DisplayOrder":10}},{"type":"Feature","id":2,"geometry":{"type":"Point","coordinates":[-122.09999999999997,36.900000000000034]},"properties":{"Row_ID":2,"Unit_ID":"2B8","Unit_Status_Desc":"LOGOFF","Unit_Status_Code":"08LF","StatusTime":1501011649000,"Inc_ID":"","Inc_Address":"","CAD_Pri_Desc":"","LastUpdate":null,"Direction":null,"Speed":null,"GPSStatus":0,"Unit_Type":null,"CurrentStation":null,"Station":null,"Agency":"SCCFD","UnitStatus":"UNAVAIL","CAD_Pri_Code":0,"TrackingID":null,"CoordX":null,"CoordY":null,"Latitude":36.9,"Longitude":-122.1,"DisplayOrder":10}}];

describe('db Integration Tests', function() {
    it('successfully saves features', function () {
        db.upsertdb("test", features, dbconnectionparams)
            .then(result => {
                expect(result).to.have.property('timestamp');
            })
    });
    it('fails to save features with invalid dbconnectionparams', function() {
        const invaliddbconnectionparams = {host: (process.env.PGHOST ? process.env.PGHOST : 'localhost'),
            port: '5432',
            user: 'invaliduser',
            password: 'invalidpassword',
            database: 'nics.datafeeds',
            passworddecrypted: true
        };
       db.upsertdb("test", features, invaliddbconnectionparams)
           .catch(error => {
               expect(error).not.to.equal(null);
           })
    });
});