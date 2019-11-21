// Internal Libraries
const constants = require('./constants.js');
const createLogs = require('./createLogs.js').createLogs;
const pkg = require('./package.json');

// External Libraries
const agent = require('agentkeepalive');
const asyncRetry = require('async').retry;
const request = require('request');


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
    const hostname = config.hostname || JSON.parse(payload[0].line).log.group;

    // Prepare HTTP Request Options
    const options = {
        url: constants.LOGDNA_URL
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
        , timeout: constants.MAX_REQUEST_TIMEOUT_MS
        , withCredentials: false
        , agent: new agent.HttpsAgent({
            freeSocketTimeout: constants.FREE_SOCKET_TIMEOUT_MS
        })
    };
    // Flush the Log
    asyncRetry({
        times: constants.MAX_REQUEST_RETRIES
        , interval: (retryCount) => {
            return constants.REQUEST_RETRY_INTERVAL_MS * Math.pow(2, retryCount);
        }
        , errorFilter: (errCode) => {
            return constants.DEFAULT_HTTP_ERRORS.includes(errCode) || errCode === 'INTERNAL_SERVER_ERROR';
        }
    }, (reqCallback) => {
        return request(options, (error, response, body) => {
            if (error) {
                return reqCallback(error.code);
            }
            if (response.statusCode >= constants.INTERNAL_SERVER_ERROR) {
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
    const logsToSend = createLogs(events);
    const config = getConfig();
    return sendLine(logsToSend, config, callback);
};
