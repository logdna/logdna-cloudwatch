process.env.LOGDNA_KEY = 'ab37921179dccd5eb6ed9898b9ef8f54';
//process.env.LOGDNA_URL = 'http://localhost:8888'

const index = require ('../index.js');
const http = require('http');
const asyncRetry = require('async').retry;
let request = require('request');

let recievedError = '';
let recievedData = ''

const testCallback = jest.fn();
var server;

let event = {
            awslogs: {
            data: 'H4sIAAAAAAAAEzWQQW+DMAyF/wrKmaEkJCbhhjbWCzuBtMNUVSmkNBIQRMKqqep/X6Cb5Ivfs58++45G7ZzqdfMza5Sjt6IpTh9lXReHEsXI3ia9BJnQlHHIhMSEBnmw/WGx6xwcp8Z50M9uN2q/aDUGx2vn/5oYufXs2sXM3tjp3QxeLw7lX6hS47lTz6lTO9i1uynfXkOMe5lsp9Fxzyy/9eS3hTsyXYhOGVCaEsBSgsyEYBkGzrDMAIMQlAq+gQIQSjFhBFgqJOUMAog34WAfoFFOOM8kA0Y5SSH+f0SIb67GRaHq/baosn1UmUlHF7tErxvk5wa56b2Z+iRJ0OP4+AWj9ITzSgEAAA=='
            }
        };
index.handler(event, {}, (e, r) => {
  console.log(e)
  console.log(r)
})
// describe('tests', function() {
//     let server;
//     beforeEach((done) => {
//
//       //console.log("set")
//       server = http.createServer(function(req, res) {
//         //  console.log(req)
//           let body;
//           req.on('data', function(data) {
//               console.log("serverrrrr")
//               console.log(req)
//               body += data;
//           });
//           req.on('end', function() {
//               //body = JSON.parse(body);
//               console.log("serverrrrr")
//               console.log(body)
//               body = '';
//           });
//           res.writeHead(404, { 'Content-Type': 'text/plain' });
//           res.end('poopopo');
//       });
//       server.on('listening', done);
//       server.listen(8887)
//     });
//
//     afterEach((done) => {
//       server.close()
//       done()
//     });
//     it('should pass error when ingestion key is not provided', function(){
//        let event = {
//             awslogs: {
//             data: 'H4sIAAAAAAAAEzWQQW+DMAyF/wrKmaEkJCbhhjbWCzuBtMNUVSmkNBIQRMKqqep/X6Cb5Ivfs58++45G7ZzqdfMza5Sjt6IpTh9lXReHEsXI3ia9BJnQlHHIhMSEBnmw/WGx6xwcp8Z50M9uN2q/aDUGx2vn/5oYufXs2sXM3tjp3QxeLw7lX6hS47lTz6lTO9i1uynfXkOMe5lsp9Fxzyy/9eS3hTsyXYhOGVCaEsBSgsyEYBkGzrDMAIMQlAq+gQIQSjFhBFgqJOUMAog34WAfoFFOOM8kA0Y5SSH+f0SIb67GRaHq/baosn1UmUlHF7tErxvk5wa56b2Z+iRJ0OP4+AWj9ITzSgEAAA=='
//             }
//         };
//        index.handler(event, {}, testCallback);
//        expect(testCallback).toHaveBeenCalledWith('Missing LogDNA Ingestion Key');
//     });
//     it.only('url is not passed. should take logdna url', function(done){
//        jest.setTimeout(30000);
//
//        let event = {
//             awslogs: {
//             data: 'H4sIAAAAAAAAEzWQQW+DMAyF/wrKmaEkJCbhhjbWCzuBtMNUVSmkNBIQRMKqqep/X6Cb5Ivfs58++45G7ZzqdfMza5Sjt6IpTh9lXReHEsXI3ia9BJnQlHHIhMSEBnmw/WGx6xwcp8Z50M9uN2q/aDUGx2vn/5oYufXs2sXM3tjp3QxeLw7lX6hS47lTz6lTO9i1uynfXkOMe5lsp9Fxzyy/9eS3hTsyXYhOGVCaEsBSgsyEYBkGzrDMAIMQlAq+gQIQSjFhBFgqJOUMAog34WAfoFFOOM8kA0Y5SSH+f0SIb67GRaHq/baosn1UmUlHF7tErxvk5wa56b2Z+iRJ0OP4+AWj9ITzSgEAAA=='
//             }
//         };
//          let myCallback = jest.fn((err, res) => {
//             console.log("Call back is called")
//             console.log(err)
//             console.log(res)
//             setTimeout(500, () => {done();});
//
//             //expect(err).toEqual('Test Error');
//          })
//          console.log(process.env.LOGDNA_URL)
//          index.handler(event, {}, myCallback);
//          //done()
//          //console.log(request.mock.calls)
//          //expect(request.mock.calls[0][0]).toEqual('https://logs.logdna.com/logs/ingest');
//          // as though request called the callback with an error
//          //request.mock.calls[0][1]("Test Error");
//          //expect(testCallback).toHaveBeenCalledWith('Test Error');
//     });
//   });
