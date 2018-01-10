
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
    authenticationUrl: (process.env.ESRIAUTHURL ? process.env.ESRIAUTHURL : ''),
    serviceurl: (process.env.ESRISERVICEURL ? process.env.ESRISERVICEURL : ''),
    queryparams : {
        f: 'geojson',
        returnGeometry: true,
        geometryType: 'esriGeometryPoint',
        where: '1=1',
        outSR: '4326'
    },
    username: (process.env.ESRIUSER ? process.env.ESRIUSER : ''),
    password: (process.env.ESRISECRET ? process.env.ESRISECRET :''),
    passworddecrypted: false,
    staleDataAfterDays: (process.env.STALEDATAAFTERDAYS ? process.env.STALEDATAAFTERDAYS : 7)
};