# Change Log

This file documents all notable changes in `LogDNA CloudWatch Lambda Function`. The release numbering uses [semantic versioning](http://semver.org).

## v2.0.0 - Released on June 5, 2019
* Releasing new `Lambda Function` written/implemented on `node.js`
* Adding Retry on `ETIMEDOUT` or `ESOCKETTIMEDOUT`
* Moving `log.group` and `log.stream` info from `meta` to the main `line`
* Adding the extra custom options configurable with environment variables

## v1.1.0 - Released on March 8, 2019
* Adding Custom Ingestion URL Option with `LOGDNA_URL` environment variable

## v1.0.0 - Released on July 18, 2018
* Initial Release