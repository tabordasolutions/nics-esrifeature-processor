
module.exports.dbconnectionparams = {
    host: (process.env.PGHOST ? process.env.PGHOST : 'localhost'),
    port: (process.env.PGPORT ? process.env.PGPORT : '5432'),
    user: (process.env.PGUSER ? process.env.PGUSER : process.env.USER),
    password: (process.env.PGPASSWORD ? process.env.PGPASSWORD : process.env.USER),
    database: (process.env.PGDATABASE ? process.env.PGDATABASE : process.env.USER),
    passworddecrypted: false,
};

module.exports.feedname = (process.env.FEEDNAME ? process.env.FEEDNAME : 'unknown');
module.exports.esriserviceparams = {
    serviceurl: (process.env.ESRISERVICEURL ? process.env.ESRISERVICEURL : ''),
    queryparams : {
        f: 'geojson',
        returnGeometry: true,
        geometryType: 'esriGeometryPoint',
        where: '1=1',
        outSR: '4326'
    },
    staleDataAfterDays: (process.env.STALEDATAAFTERDAYS ? process.env.STALEDATAAFTERDAYS : 7),
    authparams: {
        secureService: (process.env.SECURESERVICE ? (process.env.SECURESERVICE == 'true') : false),
        authenticationUrl: (process.env.ESRIAUTHURL ? process.env.ESRIAUTHURL : ''),
        username: (process.env.ESRIUSER ? process.env.ESRIUSER : ''),
        password: (process.env.ESRISECRET ? process.env.ESRISECRET : ''),
        passworddecrypted: false,
        expireauthtokeninminutes: (process.env.TOKENEXPIRESINMINUTES ? process.env.TOKENEXPIRESINMINUTES : 120),
        authtoken: '',
        authtokenexpiresat: new Date().getTime(),
        client: (process.env.CLIENT_ID_FOR_AUTH ? process.env.CLIENT_ID_FOR_AUTH : ''),
    },
};