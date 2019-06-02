// External Libraries:
const agent = require('agentkeepalive');
const request = require('request');

// Internal Libraries:
const constants = require('./constants');

// Getting Environment Variables:
const getConfig = () => {
    var config = {};

    if (process.env.LOGDNA_KEY) config.key = process.env.LOGDNA_KEY;
    if (process.env.LOGDNA_HOSTNAME) config.hostname = process.env.LOGDNA_HOSTNAME;

    if (process.env.LOGDNA_TAGS && process.env.LOGDNA_TAGS.length > 0) {
        config.tags = process.env.LOGDNA_TAGS.split(',').map(tag => tag.trim()).join(',');
    }

    return config;
};

// Message Sanity Check:
const sanitizeMessage = message => {
    var sanitized = message.substring(0, constants.MAX_LINE_LENGTH);
    if (sanitized !== message) sanitized += ' (cut off, too long...)';
    return sanitized;
};

// Parsing the gzipped Log Data:
const parseEvent = event => {
    return JSON.parse(require('zlib').unzipSync(Buffer.from(event.awslogs.data, 'base64')));
};

// Preparing the Messages and Options:
const prepareLogs = eventData => {
    return eventData.logEvents.map(event => {
        return {
            line: JSON.stringify({
                message: sanitizeMessage(event.message)
                , source: 'CloudWatchLogs'
                , event: {
                    type: eventData.messageType
                    , id: event.id
                }, log: {
                    group: eventData.logGroup
                    , stream: eventData.logStream
                }
            }), timestamp: event.timestamp
            , file: eventData.logStream
            , meta: {
                owner: eventData.owner
                , filters: eventData.subscriptionFilters
            }
        };
    });
};

// Shipping the Logs:
const send = (payload, config, callback) => {
    // Checking for Ingestion Key:
    if (!config.key) return callback('Please, Provide LogDNA Ingestion Key!');

    // Setting Hostname:
    const hostname = config.hostname || JSON.parse(payload[0].line).log.group;

    // Request Options:
    const options = {
        url: constants.BASE_URL
        , qs: config.tags ? {
            tags: config.tags
            , hostname: hostname
        } : {
            hostname: hostname
        }, method: 'POST'
        , body: JSON.stringify({
            e: 'ls'
            , ls: payload
        }), auth: {
            username: config.key
        }, headers: {
            'Content-Type': 'application/json; charset=UTF-8'
        }, timeout: constants.MAX_REQUEST_TIMEOUT
        , withCredentials: false
        , agent: new agent.HttpsAgent({
            maxSockets: constants.MAX_SOCKETS
            , keepAlive: true
            , freeSocketTimeout: constants.FREE_SOCKET_TIMEOUT
        })
    };

    // Ship the Logs:
    require('async').retry({
        times: constants.MAX_REQUEST_RETRIES
        , interval: constants.REQUEST_RETRY_INTERVAL
        , errorFilter: err => err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT'
    }, cb => {
        return request(options, (error, response, body) => {
            if (error) return cb(error);
            return cb(null, body);
        });
    }, (error, result) => {
        if (error) return callback(error);
        return callback(null, result);
    });
};

// Main Handler:
exports.handler = (event, context, callback) => {
    const config = getConfig(event)
        , eventData = parseEvent(event)
        , payload = prepareLogs(eventData);

    return send(payload, config, callback);
};
