// External Libraries
const agent = require('agentkeepalive');
const asyncRetry = require('async').retry;
const request = require('request');
const zlib = require('zlib');

// Constants
const MAX_LINE_LENGTH = parseInt(process.env.LOGDNA_MAX_LINE_LENGTH) || 32000;
const MAX_REQUEST_TIMEOUT = parseInt(process.env.LOGDNA_MAX_REQUEST_TIMEOUT) || 300;
const FREE_SOCKET_TIMEOUT = parseInt(process.env.LOGDNA_FREE_SOCKET_TIMEOUT) || 300000;
const LOGDNA_URL = process.env.LOGDNA_URL || 'https://logs.logdna.com/logs/ingest';
const MAX_REQUEST_RETRIES = parseInt(process.env.LOGDNA_MAX_REQUEST_RETRIES) || 5;
const REQUEST_RETRY_INTERVAL = parseInt(process.env.LOGDNA_REQUEST_RETRY_INTERVAL) || 100;

// Get Configuration from Environment Variables
const getConfig = () => {
    let config = {};

    if (process.env.LOGDNA_KEY) config.key = process.env.LOGDNA_KEY;
    if (process.env.LOGDNA_HOSTNAME) config.hostname = process.env.LOGDNA_HOSTNAME;
    if (process.env.LOGDNA_TAGS && process.env.LOGDNA_TAGS.length > 0) {
        config.tags = process.env.LOGDNA_TAGS.split(',').map((tag) => tag.trim()).join(',');
    }

    return config;
};

// Sanity Check: Truncate Long Message
const sanitizeMessage = (message) => {
    if (message.length > MAX_LINE_LENGTH) {
        return message.substring(0, MAX_LINE_LENGTH) + ' (truncated)';
    }
    return message;
};

// Parse the GZipped Log Data
const parseEvent = (event) => {
    return JSON.parse(zlib.unzipSync(Buffer.from(event.awslogs.data, 'base64')));
};

// Prepare the Messages and Options
const prepareLogs = (eventData) => {
    return eventData.logEvents.map((event) => {
        return {
            line: JSON.stringify({
                message: sanitizeMessage(event.message)
                , source: 'CloudWatchLogs'
                , event: {
                    type: eventData.messageType
                    , id: event.id
                }
                , log: {
                    group: eventData.logGroup
                    , stream: eventData.logStream
                }
            })
            , timestamp: event.timestamp
            , file: eventData.logStream
            , meta: {
                owner: eventData.owner
                , filters: eventData.subscriptionFilters
            }
        };
    });
};

// Ship the Logs
const sendLine = (payload, config, callback) => {
    // Check for Ingestion Key
    if (!config.key) return callback('Missing LogDNA Ingestion Key');

    // Set Hostname
    const hostname = config.hostname || JSON.parse(payload[0].line).log.group;

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
        }
        , timeout: MAX_REQUEST_TIMEOUT
        , withCredentials: false
        , agent: new agent.HttpsAgent({
            freeSocketTimeout: FREE_SOCKET_TIMEOUT
        })
    };

    // Flush the Log
    asyncRetry({
        times: MAX_REQUEST_RETRIES
        , interval: REQUEST_RETRY_INTERVAL
        , errorFilter: (err) => {
            return err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT';
        }
    }, (reqCallback) => {
        return request(options, (error, response, body) => {
            if (error) return reqCallback(error);
            return reqCallback(null, body);
        });
    }, (error, result) => {
        if (error) return callback(error);
        return callback(null, result);
    });
};

// Main Handler
exports.handler = (event, context, callback) => {
    return sendLine(prepareLogs(parseEvent(event)), getConfig(event), callback);
};
