
module.exports.dbconnectionparams = {
    host: (process.env.PGHOST ? process.env.PGHOST : 'localhost'),
    port: (process.env.PGPORT ? process.env.PGPORT : '5432'),
    user: (process.env.PGUSER ? process.env.PGUSER : process.env.USER),
    password: (process.env.PGPASSWORD ? process.env.PGPASSWORD : process.env.USER),
    database: (process.env.PGDATABASE ? process.env.PGDATABASE : process.env.USER),
    passworddecrypted: false
};

module.exports.esriserviceparams = {
    serviceurl: (process.env.SERVICEURL ? process.env.SERVICEURL : ''),
    feedname: (process.env.FEEDNAME ? process.env.FEEDNAME : 'unknown'),
    authenticationUrl: (process.env.AUTHURL ? process.env.AUTHURL : ''),
    username: (process.env.AUTHUSER ? process.env.AUTHUSER : ''),
    password: (process.env.AUTHPASSWORD ? process.env.AUTHPASSWORD :''),
    passwordecrypted: false
};



