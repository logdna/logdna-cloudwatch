// Set Ingestion Key:
exports.setEnv = (key, value) => {
    process.env[key] = value;
};

// Set Test Data Information:
exports.setData = (options) => {
    return {
        awslogs: {
            data: require('zlib').gzipSync(new Buffer(JSON.stringify({
                messageType: 'DATA_MESSAGE'
                , owner: '123456789012'
                , logGroup: options.group
                , logStream: options.stream
                , subscriptionFilters: ['LambdaStream_cloudwatchlogs-node']
                , logEvents: [{
                    id: '34622316099697884706540976068822859012661220141643892546'
                    , timestamp: Date.now()
                    , message: options.message
                }]
            }), 'ascii')).toString('base64')
        }
    };
};
