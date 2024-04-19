#!/bin/bash
mkdir -p pkg
npm ci --prod
zip pkg/logdna-cloudwatch.zip -r node_modules/ lib/ index.js package.json
