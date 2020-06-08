# CHANGELOG

This file documents all notable changes in `LogDNA CloudWatch Lambda Function`. The release numbering uses [semantic versioning](http://semver.org).

## v2.2.0 - Released on June 9, 2020
* Add `LOG_RAW_EVENT` environment variable option to set `line` to raw `event.message`

## v2.1.0 - Released on November 14, 2019
* Update retry mechanism
* Remove message truncation

## v2.0.3 - Released on November 1, 2019
* Fix bugs: change constants values to milliseconds

## v2.0.2 - Released on September 11, 2019

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
