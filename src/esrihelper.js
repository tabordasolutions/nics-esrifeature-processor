const Geoservices = require('geoservices');

let query = (serviceurl, queryparams, authenticationUrl, username, password) => {
    return getAuthToken(authenticationUrl, username, password)
        .then((tokenresult) => {return queryWithToken(serviceurl, queryparams, tokenresult)})
};

let queryWithToken = (serviceurl, queryparams, tokenresult) => new Promise((resolves, rejects) => {
            let client = new Geoservices();
            let fs = client.featureservice({url: serviceurl});
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

let getAuthToken = (authenticationUrl,username, password) => new Promise((resolves,rejects) => {
    let authoptions = {
        authenticationUrl
    };
    let client = new Geoservices(authoptions);
    client.authenticate(username, password,{},(err,result) => {
        const error = err ? err : (result.error ? result.error : null);
        error === null ?
            resolves(result) :
            rejects(error);
    })
});

module.exports = exports = {
    query: query
};
