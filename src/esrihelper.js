const Geoservices = require('geoservices');


let query = (serviceparams, query_params, authorization) => new Promise((resolves, rejects) => {
    getAuthToken(authorization.authenticationUrl,authorization.username, authorization.password)
        .then((tokenresult) => {
            let client = new Geoservices();
            let fs = client.featureservice(serviceparams);
            query_params.token = tokenresult.token;

            fs.query(query_params, (err, results) => {
                err === null ?
                    resolves(results) :
                    rejects(err);
            })
        })
        .catch(e => rejects(e))

});
let getAuthToken = (authenticationUrl,username, password) => new Promise((resolves,rejects) => {
    let authoptions = {
        authenticationUrl
    };
    let client = new Geoservices(authoptions);
    client.authenticate(username, password,{},(err,result) => {
        err === null ?
            resolves(result) :
            rejects(err);
    })
});



module.exports = exports = {
    query: query,
    getAuthToken: getAuthToken
};
