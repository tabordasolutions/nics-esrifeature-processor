const db = require('./db');

let etlesrifeatures = (feedname, features, dbconnectionparams)  => new Promise((resolves,rejects) => {
    console.log(`Processing data feed ${feedname} with ${features.length} features.`);
    db.upsertdb(feedname, features,dbconnectionparams)
        .then(() => resolves('Done processing.'))
        .catch((e) => rejects(e))
});

module.exports = exports = {
    etlesrifeatures: etlesrifeatures
};