const index = require ('../index.js');
const http = require('http');
let async = require('async');
let request = require('request');

let recievedError = '';
let recievedData = ''

const testCallback = jest.fn();
var server;
jest.mock('async');
jest.mock('request');

describe('tests', function() {
    it('should pass error when ingestion key is not provided', function(){
       let event = {
            awslogs: {
            data: 'H4sIAAAAAAAAEzWQQW+DMAyF/wrKmaEkJCbhhjbWCzuBtMNUVSmkNBIQRMKqqep/X6Cb5Ivfs58++45G7ZzqdfMza5Sjt6IpTh9lXReHEsXI3ia9BJnQlHHIhMSEBnmw/WGx6xwcp8Z50M9uN2q/aDUGx2vn/5oYufXs2sXM3tjp3QxeLw7lX6hS47lTz6lTO9i1uynfXkOMe5lsp9Fxzyy/9eS3hTsyXYhOGVCaEsBSgsyEYBkGzrDMAIMQlAq+gQIQSjFhBFgqJOUMAog34WAfoFFOOM8kA0Y5SSH+f0SIb67GRaHq/baosn1UmUlHF7tErxvk5wa56b2Z+iRJ0OP4+AWj9ITzSgEAAA=='
            }
        };
       index.handler(event, testCallback);
       expect(testCallback).toHaveBeenCalledWith('Missing LogDNA Ingestion Key');
    });
    it('the request sends an error', function(){
       process.env.LOGDNA_KEY = 'keykey';
       let event = {
            awslogs: {
            data: 'H4sIAAAAAAAAEzWQQW+DMAyF/wrKmaEkJCbhhjbWCzuBtMNUVSmkNBIQRMKqqep/X6Cb5Ivfs58++45G7ZzqdfMza5Sjt6IpTh9lXReHEsXI3ia9BJnQlHHIhMSEBnmw/WGx6xwcp8Z50M9uN2q/aDUGx2vn/5oYufXs2sXM3tjp3QxeLw7lX6hS47lTz6lTO9i1uynfXkOMe5lsp9Fxzyy/9eS3hTsyXYhOGVCaEsBSgsyEYBkGzrDMAIMQlAq+gQIQSjFhBFgqJOUMAog34WAfoFFOOM8kA0Y5SSH+f0SIb67GRaHq/baosn1UmUlHF7tErxvk5wa56b2Z+iRJ0OP4+AWj9ITzSgEAAA=='
            }
        };

        index.handler(event, testCallback);
        async.retry.mock.calls[0][1](testCallback);
        // as though it calls the callback with an error
        request.mock.calls[0][1]("test error")
        expect(request.mock.calls[0][0].url).toEqual('https://logs.logdna.com/logs/ingest');
        expect(testCallback).toHaveBeenCalledWith('test error');
    });
    it('the request sends results', function(){
       process.env.LOGDNA_KEY = 'keykey';
       let event = {
            awslogs: {
            data: 'H4sIAAAAAAAAEzWQQW+DMAyF/wrKmaEkJCbhhjbWCzuBtMNUVSmkNBIQRMKqqep/X6Cb5Ivfs58++45G7ZzqdfMza5Sjt6IpTh9lXReHEsXI3ia9BJnQlHHIhMSEBnmw/WGx6xwcp8Z50M9uN2q/aDUGx2vn/5oYufXs2sXM3tjp3QxeLw7lX6hS47lTz6lTO9i1uynfXkOMe5lsp9Fxzyy/9eS3hTsyXYhOGVCaEsBSgsyEYBkGzrDMAIMQlAq+gQIQSjFhBFgqJOUMAog34WAfoFFOOM8kA0Y5SSH+f0SIb67GRaHq/baosn1UmUlHF7tErxvk5wa56b2Z+iRJ0OP4+AWj9ITzSgEAAA=='
            }
        };

        index.handler(event, testCallback);
        async.retry.mock.calls[0][1](testCallback);
        // as though it calls the callback with results
        request.mock.calls[0][1](null, {responseCode: 200}, 'Good results');
        expect(request.mock.calls[0][0].url).toEqual('https://logs.logdna.com/logs/ingest');
        expect(testCallback).toHaveBeenCalledWith(null, 'Good results');
    });
     // This scenario is not testable. becasue the process.env is not getting re-evaluated
     // at the time when the server is called

    // it('use the process.env url when it is defined', function(){
    //    process.env.LOGDNA_KEY = 'keykey';
    //    process.env.LOGDNA_URL = 'my.test.url.com';
    //    let event = {
    //         awslogs: {
    //         data: 'H4sIAAAAAAAAEzWQQW+DMAyF/wrKmaEkJCbhhjbWCzuBtMNUVSmkNBIQRMKqqep/X6Cb5Ivfs58++45G7ZzqdfMza5Sjt6IpTh9lXReHEsXI3ia9BJnQlHHIhMSEBnmw/WGx6xwcp8Z50M9uN2q/aDUGx2vn/5oYufXs2sXM3tjp3QxeLw7lX6hS47lTz6lTO9i1uynfXkOMe5lsp9Fxzyy/9eS3hTsyXYhOGVCaEsBSgsyEYBkGzrDMAIMQlAq+gQIQSjFhBFgqJOUMAog34WAfoFFOOM8kA0Y5SSH+f0SIb67GRaHq/baosn1UmUlHF7tErxvk5wa56b2Z+iRJ0OP4+AWj9ITzSgEAAA=='
    //         }
    //     };
    //
    //     index.handler(event, {}, testCallback);
    //     async.retry.mock.calls[0][1](testCallback);
    //     // as though it calls the callback with an error
    //     request.mock.calls[0][1]("test error")
    //     console.log("!!!!")
    //     console.log(request.mock.calls[0][0].url)
    //     expect(request.mock.calls[0][0].url).toEqual('https://logs.logdna.com/logs/ingest');
    //     expect(testCallback).toHaveBeenCalledWith('test error');
    // });
  });
