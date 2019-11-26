// Internal Libraries
const cloudWatch = require('./lib/cloudWatch.js').createLogs;
const pkg = require('./package.json');

// External Libraries
const agent = require('agentkeepalive');
const asyncRetry = require('async').retry;
const request = require('request');

const MAX_REQUEST_TIMEOUT_MS = parseInt(process.env.LOGDNA_MAX_REQUEST_TIMEOUT) || 30000;
const FREE_SOCKET_TIMEOUT_MS = parseInt(process.env.LOGDNA_FREE_SOCKET_TIMEOUT) || 300000;
const LOGDNA_URL = process.env.LOGDNA_URL || 'https://logs.logdna.com/logs/ingest';
const MAX_REQUEST_RETRIES = parseInt(process.env.LOGDNA_MAX_REQUEST_RETRIES) || 5;
const REQUEST_RETRY_INTERVAL_MS = parseInt(process.env.LOGDNA_REQUEST_RETRY_INTERVAL) || 100;
const DEFAULT_HTTP_ERRORS = [
    'ECONNRESET'
    , 'EHOSTUNREACH'
    , 'ETIMEDOUT'
    , 'ESOCKETTIMEDOUT'
    , 'ECONNREFUSED'
    , 'ENOTFOUND'];
const INTERNAL_SERVER_ERROR = 500;


// Get Configuration from Environment Variables
const getConfig = () => {
    let config = {
        UserAgent: `${pkg.name}/${pkg.version}`
    };
    if (process.env.LOGDNA_KEY) config.key = process.env.LOGDNA_KEY;
    if (process.env.LOGDNA_HOSTNAME) config.hostname = process.env.LOGDNA_HOSTNAME;
    if (process.env.LOGDNA_TAGS && process.env.LOGDNA_TAGS.length > 0) {
        config.tags = process.env.LOGDNA_TAGS.split(',').map(tag => tag.trim()).join(',');
    }

    return config;
};

// Ship the Logs
const sendLine = (payload, config, callback) => {
    // Check for Ingestion Key
    if (!config.key) return callback('Missing LogDNA Ingestion Key');
    // Set Hostname
    let hostname;
    if (config.hostname) {
        hostname = config.hostname;
    } else {
        try {
            hostname = JSON.parse(payload[0].line).log.group;
        } catch (error) {
            return callback('Hostname is not set and payload.log.group in a bad format');
        }
    }
    // Prepare HTTP Request Options
    const options = {
        url: LOGDNA_URL
        , qs: config.tags ? {
            tags: config.tags
            , hostname: hostname
        } : {
            hostname: hostname
        }
        , method: 'POST'
        , body: JSON.stringify({
            e: 'ls'
            , ls: payload
        })
        , auth: {
            username: config.key
        }
        , headers: {
            'Content-Type': 'application/json; charset=UTF-8'
            , 'user-agent': config.UserAgent
        }
        , timeout: MAX_REQUEST_TIMEOUT_MS
        , withCredentials: false
        , agent: new agent.HttpsAgent({
            freeSocketTimeout: FREE_SOCKET_TIMEOUT_MS
        })
    };
    // Flush the Log
    asyncRetry({
        times: MAX_REQUEST_RETRIES
        , interval: (retryCount) => {
            return REQUEST_RETRY_INTERVAL_MS * Math.pow(2, retryCount);
        }
        , errorFilter: (errCode) => {
            return DEFAULT_HTTP_ERRORS.includes(errCode) || errCode === 'INTERNAL_SERVER_ERROR';
        }
    }, (reqCallback) => {
        return request(options, (error, response, body) => {
            if (error) {
                return reqCallback(error.code);
            }
            if (response.statusCode >= INTERNAL_SERVER_ERROR) {
                return reqCallback('INTERNAL_SERVER_ERROR');
            }
            return reqCallback(null, body);
        });
    }, (error, result) => {
        if (error) return callback(error);

        return callback(null, result);
    });
};

// Main Handler
exports.handler = (events, context, callback) => {
    return sendLine(cloudWatch(events, callback), getConfig(), callback);
};
