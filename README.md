[![CircleCI](https://circleci.com/gh/logdna/logdna-cloudwatch.svg?style=svg)](https://circleci.com/gh/logdna/logdna-cloudwatch)

# LogDNA CloudWatch Lambda Function

The LogDNA AWS CloudWatch integration relies on [AWS Lambda](https://aws.amazon.com/documentation/lambda/) to route your [CloudWatch Logs](http://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html) to LogDNA.

## How to Use
### Deploy the Code
1. Create a [new Lambda function](https://console.aws.amazon.com/lambda) and select `Author from scratch`
2. Click on the Lambda function to edit the details:
 * Code entry type: `Upload a .ZIP file`
 * Upload our LogDNA Lambda function [.ZIP File](https://github.com/logdna/logdna-cloudwatch/releases/latest/download/logdna-cloudwatch.zip).
 * Handler: `index.handler`
 * Runtime: `Node.js 16.x`

### Configuration
#### General Configuration
If the S3 Lambda is being used to stream from gzipped files:
1. Set `Timeout` to, at least, `10 seconds`.
2. Set `Memory` limit to, at least, `128 MB`.

**Notes**:
 * The recommended number of retries is 0 because retrying lambda execution can result in duplicate logs. It can be modified in `Configuration > Asynchronous invocation`.

#### Triggers
Add `CloudWatch Logs` as a trigger with the following configuration:
 * Select the `CloudWatch Log Group` to be sent to LogDNA.
 * Choose your own custom `Filter Name`.
 * Optional `Filter Pattern` option can be used to filter the logs before shipping to LogDNA.

**Notes**:
 * You can specify only one `CloudWatch Log Group` in one trigger.

#### Permissions
For Execution role, assign a role that has the following policies:
 * [`CloudWatchLogsReadOnlyAccess`](https://gist.github.com/bernadinm/6f68bfdd015b3f3e0a17b2f00c9ea3f8#file-all_aws_managed_policies-json-L5237-L5263)
 * [`AWSLambdaBasicExecutionRole`](https://gist.github.com/bernadinm/6f68bfdd015b3f3e0a17b2f00c9ea3f8#file-all_aws_managed_policies-json-L1447-L1473)

#### Environment Variables
Set `LOGDNA_KEY` variable to your LogDNA ingestion key. Optionally, you can use the following environment variables:
 * `LOGDNA_HOSTNAME`: Alternative Host Name
 * `LOGDNA_TAGS`: Comma-separated Tags
 * `LOGDNA_URL`: Custom Ingestion URL
 * `LOG_RAW_EVENT`: Setting `line` to Raw `event.message` *(Default: false)*:
    * It can be enabled by setting `LOG_RAW_EVENT` to `YES` or `TRUE`
    * Enabling it moves the following `event`-related `meta` data from the `line` field to the `meta` field:
        * `event.type`: `messageType` of `CloudWatch Log` encoded inside `awslogs.data` in `base64`
        * `event.id`: `id` of each `CloudWatch Log` encoded inside `awslogs.data` in `base64`
        * `log.group`: `LogGroup` where the log is coming from
        * `log.stream`: `LogStream` where the log is coming from

**Notes**:
The following optional environment variables can also be used to tune this Lambda function for specific use cases. 
 * `LOGDNA_MAX_REQUEST_TIMEOUT`: Time limit (in `milliseconds`) for requests made by this HTTP Client *(Default: 30000)*
 * `LOGDNA_FREE_SOCKET_TIMEOUT`: How long (in `milliseconds`) to wait for inactivity before timing out on the free socket *(Default: 300000)*
 * `LOGDNA_MAX_REQUEST_RETRIES`: The maximum number of retries for sending a line when there are network failures *(Default: 5)*
 * `LOGDNA_REQUEST_RETRY_INTERVAL`: How frequently (in `milliseconds`) to retry for sending a line when there are network failures *(Default: 100)*

#### Monitoring
Enabling monitoring means forwarding the metrics and logs about the execution of the CloudWatch Lambda function to `CloudWatch`. You can also create and use a separate CloudWatch Lambda function to monitor the performance of this CloudWatch Lambda function.

### Test
You can test the configuration and code package using the following test input containing the sample event data:
```json
{
    "awslogs": {
        "data": "H4sIAAAAAAAAEzWQQW+DMAyF/wrKmaEkJCbhhjbWCzuBtMNUVSmkNBIQRMKqqep/X6Cb5Ivfs58++45G7ZzqdfMza5Sjt6IpTh9lXReHEsXI3ia9BJnQlHHIhMSEBnmw/WGx6xwcp8Z50M9uN2q/aDUGx2vn/5oYufXs2sXM3tjp3QxeLw7lX6hS47lTz6lTO9i1uynfXkOMe5lsp9Fxzyy/9eS3hTsyXYhOGVCaEsBSgsyEYBkGzrDMAIMQlAq+gQIQSjFhBFgqJOUMAog34WAfoFFOOM8kA0Y5SSH+f0SIb67GRaHq/baosn1UmUlHF7tErxvk5wa56b2Z+iRJ0OP4+AWj9ITzSgEAAA=="
    }
}
```

## License
Copyright © [LogDNA](https://logdna.com), released under an MIT license. See the [LICENSE](./LICENSE) file and https://opensource.org/licenses/MIT

## Contributing
Contributions are always welcome. See the [contributing guide](/CONTRIBUTING.md) to learn how you can help.

*Happy Logging!*
