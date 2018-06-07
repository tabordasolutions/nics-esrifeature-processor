const Geoservices = require('geoservices');

function EsriIntegrationService(authparams) {
    this.authparams = authparams;
    let authenticationUrl = authparams.authenticationUrl;
    let authoptions = {
        authenticationUrl
    };
    this.geoServicesClient = new Geoservices(authoptions);
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
    if(!(this.authparams.username && this.authparams.password)) {
        console.log('Username or password are empty, no token generated');
        return Promise.resolve(null);
    }
    if(this.authparams.authtoken && this.authparams.authtokenexpiresat > (new Date()).getTime()) {
        console.log('Reusing old token');
        return Promise.resolve(this.authparams.authtoken);
    }
    return new Promise((resolves,rejects) => {
        this.geoServicesClient.authenticate(username = this.authparams.username, password = this.authparams.password, {expiration : this.authparams.expireauthtokeninminutes, client: this.authparams.client}, (err,result) => {
            const error = err ? err : (result.error ? result.error : null);
            if(error === null) {
                this._saveauthtoken(result); //save token for next run until it expires.
                resolves(result.token);
            } else {
                rejects(error);
            }
        })
    });
};

EsriIntegrationService.prototype._saveauthtoken = function(result) {
    this.authparams.authtoken = result.token;
    this.authparams.authtokenexpiresat = result.expires;
};

module.exports = exports = EsriIntegrationService;