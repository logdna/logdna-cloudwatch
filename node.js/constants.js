module.exports = {
    MAX_LINE_LENGTH: parseInt(process.env.LOGDNA_MAX_LINE_LENGTH) || 32000
    , MAX_REQUEST_TIMEOUT: parseInt(process.env.LOGDNA_MAX_REQUEST_TIMEOUT) || 300
    , MAX_SOCKETS: parseInt(process.env.LOGDNA_MAX_SOCKETS) || 20
    , FREE_SOCKET_TIMEOUT: parseInt(process.env.LOGDNA_FREE_SOCKET_TIMEOUT) || 300000
    , BASE_URL: process.env.LOGDNA_URL || 'https://logs.logdna.com/logs/ingest'
    , MAX_REQUEST_RETRIES: parseInt(process.env.LOGDNA_MAX_REQUEST_RETRIES) || 5
    , REQUEST_RETRY_INTERVAL: parseInt(process.env.LOGDNA_REQUEST_RETRY_INTERVAL) || 100
};
