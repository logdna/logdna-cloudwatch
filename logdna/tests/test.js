const index = require('../lib/index.js');

let asyncRetry = require('async').retry;
let request = require('request');
jest.mock('async');
jest.mock('request');

const testCallback = jest.fn();
const errorObject = {code: 'testError'};
const mockRes = {responseCode: 200};
const mockBody = {body: 'mockBody'};
const awsEvent = {
    awslogs: {
        /* eslint-disable max-len */
        data: 'H4sIAAAAAAAAEzWQQW+DMAyF/wrKmaEkJCbhhjbWCzuBtMNUVSmkNBIQRMKqqep/X6Cb5Ivfs58++45G7ZzqdfMza5Sjt6IpTh9lXReHEsXI3ia9BJnQlHHIhMSEBnmw/WGx6xwcp8Z50M9uN2q/aDUGx2vn/5oYufXs2sXM3tjp3QxeLw7lX6hS47lTz6lTO9i1uynfXkOMe5lsp9Fxzyy/9eS3hTsyXYhOGVCaEsBSgsyEYBkGzrDMAIMQlAq+gQIQSjFhBFgqJOUMAog34WAfoFFOOM8kA0Y5SSH+f0SIb67GRaHq/baosn1UmUlHF7tErxvk5wa56b2Z+iRJ0OP4+AWj9ITzSgEAAA=='
        /* eslint-enable max-len */
    }
};
process.env.LOGDNA_KEY = 'keykey';
describe('making a request', function() {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('calls the cb with the error if the request sends an error', function() {
        index.handler(awsEvent, {}, testCallback);
        asyncRetry.mock.calls[0][1](testCallback);
        // as though it calls the callback with an error
        request.mock.calls[0][1](errorObject);
        expect(request.mock.calls[0][0].url).toEqual('https://logs.logdna.com/logs/ingest');
        expect(testCallback).toHaveBeenCalledWith(errorObject.code);
    });
    it('calls the cb with the results if the request sends results', function() {
        index.handler(awsEvent, {}, testCallback);
        asyncRetry.mock.calls[0][1](testCallback);
        // as though it calls the callback with results
        request.mock.calls[0][1](null, mockRes, mockBody);
        expect(request.mock.calls[0][0].url).toEqual('https://logs.logdna.com/logs/ingest');
        expect(testCallback).toHaveBeenCalledWith(null, mockBody);
    });
});

describe('configuration varieties', function() {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('sets hostname and tags from process env when given', function() {
        process.env.LOGDNA_HOSTNAME = 'mock_hostname';
        process.env.LOGDNA_TAGS = 'tag1,tag2';

        index.handler(awsEvent, {}, testCallback);
        asyncRetry.mock.calls[0][1](testCallback);

        expect(request.mock.calls[0][0].qs.hostname).toEqual(process.env.LOGDNA_HOSTNAME);
        expect(request.mock.calls[0][0].qs.tags).toEqual(process.env.LOGDNA_TAGS);
    });
    it('sets hostname to loggroup and ignores tags when they are absent in process.env', function() {
        delete process.env.LOGDNA_HOSTNAME;
        delete process.env.LOGDNA_TAGS;

        index.handler(awsEvent, {}, testCallback);
        asyncRetry.mock.calls[0][1](testCallback);

        expect(request.mock.calls[0][0].qs.hostname).toEqual('sampleGroup');
        expect(request.mock.calls[0][0].qs.tags).toEqual(undefined);
    });
    it('calls the cb with the error, when ingestion key is not provided', function() {
        delete process.env.LOGDNA_KEY;
        index.handler(awsEvent, {}, testCallback);

        expect(testCallback).toHaveBeenCalledWith('Missing LogDNA Ingestion Key');
    });
});
