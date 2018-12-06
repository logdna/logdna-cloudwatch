# LogDNA CloudWatch

The LogDNA AWS CloudWatch integration relies on [AWS Lambda](https://aws.amazon.com/documentation/lambda/) to route your [CloudWatch Logs](http://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html) to LogDNA.

## Configure the LogDNA AWS Lambda function

1. Create a new Lambda function and skip to the Configure function section
2. Set the following fields:
* Name: `LogDNA`
* Runtime: `Python 2.7`
* Code entry type: `Upload a .ZIP file`
* Upload a [.ZIP file](https://s3.amazonaws.com/repo.logdna.com/integrations/cloudwatch/lambda.zip)
* Handler: `logdna_cloudwatch.lambda_handler`
* Environment variables: 
    * (Required) LOGDNA_KEY: LOGDNA_KEY YOUR_INGESTION_KEY_HERE
    * (Optional) LOGDNA_HOSTNAME: Alternative Host Name
    * (Optional) LOGDNA_TAGS: Comma-separated Tags
    * (Optional) LOGDNA_URL: Alternative LogDNA Server
4. Click `Create function`

## Configure your AWS CloudWatch Stream

1. Select the CloudWatch Log Group to upload to LogDNA
2. Click the Actions menu and select `Stream to AWS Lambda`
3. Select the `LogDNA` Lambda function and click `Next`
4. Select the desired log format and click `Start Streaming`

## Contributing

Contributions are always welcome. See the [contributing guide](/CONTRIBUTING.md) to learn how you can help. Build instructions for the agent are also in the guide.
