const moment = require('moment-timezone');
const { Client } = require('pg');

function FeatureProcessorDAO(connectionparams, client) {
    this.connectionparams = connectionparams;
    //injected for testing
    this._client = client;
}

FeatureProcessorDAO.prototype.upsertFeatures = function(feedname, features = []) {
    return (new Promise((resolves, rejects) => {
        let AsOfDateLocalTZ = moment().tz("US/Pacific").format();
        let upsertrecord_querytext = 'Select upsert_geojson_point_record($1, $2, $3, $4, $5)';
        if (!feedname) throw new Error('Missing required parameter: feedname');
        if (!features || features.length == 0) {
            console.log(`No valid features to persist for feedname: ${feedname}`);
            resolves({timestamp: AsOfDateLocalTZ});
        }

        console.log('Current Timestamp is: ', AsOfDateLocalTZ);
        let client = this._getClient();
            //client connect() promise doesn't behave well, so using old school callback.
        client.connect((err) => {
            if (err) {
                rejects(new Error(`Could not connect to dbhost ${this.connectionparams.host}:${this.connectionparams.port} - ${err.message}`));
            } else {
                console.log('Connected to Db');
                //Start the work with chained promises.
                client.query('BEGIN')
                    .then(() => {return Promise.all(features.map(({id, geometry, properties}) =>
                    { client.query(upsertrecord_querytext, [feedname, id, AsOfDateLocalTZ, JSON.stringify(geometry), JSON.stringify(properties)]);}))})
                    .then(() => console.log(`Successfully processed ${features.length} records`))
                    .then(() => {return client.query('COMMIT')} )
                    .then(() => console.log(`Committed transaction`))
                    .then(() => { return client.end() })
                    .then(() => console.log('Disconnected database client'))
                    .then(() => resolves({timestamp: AsOfDateLocalTZ}))
                    .catch(e => {
                        console.error(`Error occurred during processing: ${e}`);
                        client.query('ROLLBACK')
                            .then(() => console.error('Aborted transaction'))
                            .catch((e) => console.error(`Error aborting transaction: ${e}`))
                            .then(() => {
                                console.error('Disconnecting Client');
                                client.end();
                            })
                            .catch((e) => console.error(`Error disconnecting client: ${e}`))
                            .then(() => rejects(e))
                    });
            }
        })
    }));
};

FeatureProcessorDAO.prototype.deleteRecordsBefore = function(asofdatetime, feedname) {
    return new Promise((resolves,rejects) => {
        if (!feedname || !asofdatetime) rejects(new Error('Invalid Argument(s)'));
        let client = this._getClient();
        client.connect((err) => {
            if (err) {
                throw err;
            }
            else {
                client.query('BEGIN')
                    .then(() => client.query('DELETE FROM geojson_point_feeds WHERE created_at < $1 AND feedname=$2', [asofdatetime, feedname]))
                    .then(result => returnmessage = `Deleted ${result.rowCount} stale records older than ${asofdatetime}`)
                    .then(() => client.query('COMMIT'))
                    .then(() => client.end())
                    .then(() => {console.log(returnmessage); resolves();})
                    .catch(e => {
                        returnmessage = `Error deleting feed ${feedname} records before ${asofdatetime} : ${e}`;
                        client.query('ROLLBACK')
                            .then(() => console.error('Aborted transaction'))
                            .catch((e) => console.error(`Error aborting transaction: ${e}`))
                            .then(() => {
                                console.error('Disconnecting Client');
                                client.end();
                            })
                            .catch((e) => console.error(`Error disconnecting client: ${e}`))
                            .then(() => rejects(e))
                    })
            }
        })
    });
};

//utility method returns injected client if available Or creates new client for each request. pg library requires new
//    client for each transaction.
FeatureProcessorDAO.prototype._getClient = function() {
    return this._client ? this._client : new Client(this.connectionparams);
}

module.exports = exports = FeatureProcessorDAO;