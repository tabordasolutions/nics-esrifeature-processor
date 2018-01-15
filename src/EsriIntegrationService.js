const Geoservices = require('geoservices');

function EsriIntegrationService(authparams, geoServicesClient) {
    this.username = authparams.username;
    this.password = authparams.password;
    this.expireauthtokeninminutes = authparams.expireauthtokeninminutes;
    this.authtoken = authparams.authtoken;
    this.authtokenexpiresat = authparams.authtokenexpiresat;
    let authenticationUrl = authparams.authenticationUrl;
    let authoptions = {
        authenticationUrl
    };
    this.geoServicesClient = geoServicesClient ? geoServicesClient : new Geoservices(authoptions);
};

EsriIntegrationService.prototype.query = function(serviceurl, queryparams) {
    return this.getAuthToken()
        .then((token) => {console.log('About to query ESRI service.'); return this.queryWithToken(serviceurl, queryparams, token);})
        .catch(e => {throw e;});
};

EsriIntegrationService.prototype.queryWithToken = function(serviceurl, queryparams, token) {
    return new Promise((resolves, rejects) => {
        let fs = this.geoServicesClient.featureservice({url: serviceurl});
        let query_params = Object.assign({}, queryparams);
        query_params.token = token;

        fs.query(query_params, (err, results) => {
            if(err === null) {
                resolves(results);
            } else {
                rejects(err);
            }
        })
    });
};

EsriIntegrationService.prototype.getAuthToken = function() {
    if(this.authtoken && this.authtokenexpiresat > (new Date()).getTime()) {
        console.log('Reusing old token');
        return Promise.resolve(this.authtoken);
    }
    return new Promise((resolves,rejects) => {
        this.geoServicesClient.authenticate(username = this.username, password = this.password, {expiration : this.expireauthtokeninminutes}, (err,result) => {
            const error = err ? err : (result.error ? result.error : null);
            if(error === null) {
                saveauthtoken(result); //save token for next run until it expires.
                resolves(result.token);
            } else {
                rejects(error);
            }
        })
    });
};

let saveauthtoken = function(result) {
    this.authtoken = result.token;
    this.authtokenexpiresat = result.expires;
    process.env.AUTHTOKEN = result.token;
    process.env.AUTHTOKENEXPIRESAT = result.expires;
};

module.exports = exports = EsriIntegrationService;