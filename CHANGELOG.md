# CHANGELOG

This file documents all notable changes in `LogDNA CloudWatch Lambda Function`. The release numbering uses [semantic versioning](http://semver.org).

## v2.0.2, v2.0.3 - Released on November 1, 2019
* Fix bugs: change constants values to milliseconds [commit](https://github.com/logdna/logdna-cloudwatch/commit/7a26f4730cbac052387c782ec86711a132ab7082)

## v2.0.1 - Released on September 5, 2019
* Add `user-agent` to `req.headers` to track the clients better
* Add `CHANGELOG` and `Semantic Versioning`

## v2.0.0 - Released on June 5, 2019
* Release new `Lambda Function` written/implemented on `node.js`
* Add Retry on `ETIMEDOUT` or `ESOCKETTIMEDOUT`
* Move `log.group` and `log.stream` info from `meta` to the main `line`
* Add the extra custom options configurable with environment variables

## v1.1.0 - Released on March 8, 2019
* Add Custom Ingestion URL Option with `LOGDNA_URL` environment variable

## v1.0.0 - Released on July 18, 2018
* Initial Release
