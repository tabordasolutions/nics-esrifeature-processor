const Geoservices = require('geoservices');

function EsriIntegrationService(authenticationUrl, username, password, geoServicesClient) {
    this.username = username;
    this.password = password;
    let authoptions = {
        authenticationUrl
    };
    this.geoServicesClient = geoServicesClient ? geoServicesClient : new Geoservices(authoptions);
};

EsriIntegrationService.prototype.query = function(serviceurl, queryparams) {
    return this.getAuthToken()
        .then((tokenresult) => {return this.queryWithToken(serviceurl, queryparams, tokenresult)})
        .catch(e => {throw e;});
};

EsriIntegrationService.prototype.queryWithToken = function(serviceurl, queryparams, tokenresult) {
    return new Promise((resolves, rejects) => {
        let fs = this.geoServicesClient.featureservice({url: serviceurl});
        let query_params = Object.assign({}, queryparams);
        query_params.token = tokenresult.token;

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
    return new Promise((resolves,rejects) => {
        this.geoServicesClient.authenticate(username = this.username, password = this.password, {}, (err,result) => {
            const error = err ? err : (result.error ? result.error : null);
            error === null ?
                resolves(result) :
                rejects(error);
        })
    });
};

module.exports = exports = EsriIntegrationService;