module.exports = {
    MAX_LINE_LENGTH: parseInt(process.env.LOGDNA_MAX_LINE_LENGTH) || 32000
    , MAX_REQUEST_TIMEOUT_MS: parseInt(process.env.LOGDNA_MAX_REQUEST_TIMEOUT) || 30000
    , FREE_SOCKET_TIMEOUT_MS: parseInt(process.env.LOGDNA_FREE_SOCKET_TIMEOUT) || 300000
    , LOGDNA_URL: process.env.LOGDNA_URL || 'https://logs.logdna.com/logs/ingest'
    , MAX_REQUEST_RETRIES: parseInt(process.env.LOGDNA_MAX_REQUEST_RETRIES) || 5
    , REQUEST_RETRY_INTERVAL_MS: parseInt(process.env.LOGDNA_REQUEST_RETRY_INTERVAL) || 100
    , DEFAULT_HTTP_ERRORS: [
        'ECONNRESET'
        , 'EHOSTUNREACH'
        , 'ETIMEDOUT'
        , 'ESOCKETTIMEDOUT'
        , 'ECONNREFUSED'
        , 'ENOTFOUND']
    , INTERNAL_SERVER_ERROR: 500
};
