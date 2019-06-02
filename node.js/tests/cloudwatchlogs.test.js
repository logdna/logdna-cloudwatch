// Method:
const cloudwatchlogs = require('../index');

// Utilities:
const utils = require('./utils');

// Initialization:
beforeAll(() => {
    utils.setEnv('LOGDNA_TAGS', 'jest,unittesting,testing,lambda,logdna,logging,test');
});

// Test Suites:
describe('CloudWatchLogs Testing', () => {
    
    test('Without Ingestion Key', (done) => {
        utils.setEnv('LOGDNA_KEY', '');
        cloudwatchlogs.handler(utils.setData({
            message: 'This is Sample Log Line for CloudWatch Logging...'
            , group: 'sampleGroup'
            , stream: 'testStream'
            , type: 'cloudwatchlogs'
        }), {}, (error, result) => {
            expect(error).toBe('Please, Provide LogDNA Ingestion Key!');
            expect(result).toBe(undefined);
            return done();
        });
    });

    test('With Dummy Ingestion Key', (done) => {
        utils.setEnv('LOGDNA_KEY', '0123456789012345');
        cloudwatchlogs.handler(utils.setData({
            message: 'This is Sample Log Line for CloudWatch Logging...'
            , group: 'sampleGroup'
            , stream: 'testStream'
            , type: 'cloudwatchlogs'
        }), {}, (error, result) => {
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
        utils.setEnv('LOGDNA_KEY', process.env.LDNA_KEY);
        cloudwatchlogs.handler(utils.setData({
            message: 'This is Sample Log Line for CloudWatch Logging...'
            , group: 'sampleGroup'
            , stream: 'testStream'
            , type: 'cloudwatchlogs'
        }), {}, (error, result) => {
            expect(error).toBe(null);
            expect(JSON.parse(result)).toMatchObject({
                status: 'ok'
            });
            return done();
        });
    });
});
