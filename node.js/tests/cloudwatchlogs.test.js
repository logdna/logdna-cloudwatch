const cloudwatchlogs = require('../index');

// Preparing Test Data
const getTestData = (message, logGroup, logStream) => {
    return {
        awslogs: {
            data: require('zlib').gzipSync(new Buffer(JSON.stringify({
                messageType: 'DATA_MESSAGE'
                , owner: '123456789012'
                , logGroup: logGroup
                , logStream: logStream
                , subscriptionFilters: ['LambdaStream_cloudwatchlogs-node']
                , logEvents: [{
                    id: '34622316099697884706540976068822859012661220141643892546'
                    , timestamp: Date.now()
                    , message: message
                }]
            }), 'ascii')).toString('base64')
        }
    };
};

// Initialization
beforeAll(() => {
    process.env.LOGDNA_TAGS = 'jest,unittesting,testing,lambda,logdna,logging,test';
});

// Test Suites
describe('CloudWatchLogs Testing', () => {
    test('Without Ingestion Key', (done) => {
        process.env.LOGDNA_KEY = '';
        cloudwatchlogs.handler(getTestData(
            'This is Sample Log Line for CloudWatch Logging...'
            , 'sampleGroup'
            , 'testStream'
        ), {}, (error, result) => {
            expect(error).toBe('Please, Provide LogDNA Ingestion Key!');
            expect(result).toBe(undefined);
            return done();
        });
    });

    test('With Dummy Ingestion Key', (done) => {
        process.env.LOGDNA_KEY = '0123456789012345';
        cloudwatchlogs.handler(getTestData(
            'This is Sample Log Line for CloudWatch Logging...'
            , 'sampleGroup'
            , 'testStream'
        ), {}, (error, result) => {
            expect(error).toBe(null);
            expect(result).toBe(JSON.stringify({
                error: 'Account not found'
                , code: 'NotAuthorized'
                , status: 'error'
            }));
            return done();
        });
    });

    test('Successful Case', (done) => {
        process.env.LOGDNA_KEY = process.env.LDNA_KEY;
        cloudwatchlogs.handler(getTestData(
            'This is Sample Log Line for CloudWatch Logging...'
            , 'sampleGroup'
            , 'testStream'
        ), {}, (error, result) => {
            expect(error).toBe(null);
            expect(JSON.parse(result)).toMatchObject({
                status: 'ok'
            });
            return done();
        });
    });
});
