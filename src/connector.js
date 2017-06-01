'use strict'

const events = require('events')
const couchbase = require('couchbase');
const pckg = require('../package.json')

/**
 * This class connects deepstream.io to a couchbase storage/db, using the
 * couchbase library.
 *
 * @param {Object} options { serverLocation: <mixed>, [memcachedOptions]: <Object> }
 *
 * @constructor
 */
class Connector extends events.EventEmitter {
  constructor(options) {
    super(options)
    this.isReady = false
    this.name = pckg.name
    this.version = pckg.version
    this._options = options

    if(typeof options !== 'object') {
      throw new Error('Missing or invalid options for connector. Expecting Object.');
    }

    if (!this._options.host) {
      throw new Error('Missing parameter \'host\' for couchbase connector.')
    }

    this._cluster = new couchbase.Cluster(this._options.host);
    this._bucket = this._cluster.openBucket(this._options.bucket, this._options.password);

    this._bucket.on('connect', () => {
      process.nextTick(this._ready.bind(this))
    });

    this._bucket.on('error', err => {
      this.emit('error', err);
    });
  }

  /**
   * Writes a value to the cache.
   *
   * @param {String}   key
   * @param {Object}   value
   * @param {Function} callback Should be called with null for successful set operations or with an error message string
   *
   * @private
   * @returns {void}
   */
  set(key, value, callback) {
    this._bucket.upsert(key, value, this._onResponse.bind(this, callback));
  }

  /**
   * Retrieves a value from the cache
   *
   * @param {String}   key
   * @param {Function} callback Will be called with null and the stored object
   *                            for successful operations or with an error message string
   *
   * @private
   * @returns {void}
   */
  get(key, callback) {

    this._bucket.get(key, (err, val) => {
      if(err && err.code != 13) // Code 13 means value doesn't exist on server. We don't consider that an error here.
        return callback(err);

      if(val === undefined)
        return callback(null, null);

      if(val && val.value)
        val = val.value;

      callback(null, val);
    });
  }

  /**
   * Deletes an entry from the cache.
   *
   * @param   {String}   key
   * @param   {Function} callback Will be called with null for successful deletions or with
   *                     an error message string
   *
   * @private
   * @returns {void}
   */
  delete(key, callback) {
    this._bucket.remove(key, (err, cas, misses) => {
      if(err)
        return callback(err);

      callback(null);
    });
  }

  _ready() {
    this.isReady = true
    this.emit('ready')
  }

  _onResponse(callback, error) {
    if (error) {
      callback(error)
    } else {
      callback(null)
    }
  }
}

module.exports = Connector

