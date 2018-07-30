from botocore.vendored import requests
import os
import json
import gzip
from StringIO import StringIO

LOGDNA_URL = 'https://logs.logdna.com/logs/ingest'
MAX_LINE_LENGTH = 32000
MAX_REQUEST_TIMEOUT = 30

def lambda_handler(event, context):
    key, hostname, tags = setup()
    cw_log_lines = decodeEvent(event)
    messages, options = prepare(cw_log_lines, hostname, tags)
    sendLog(messages, options, key)

def setup():
    key = os.environ.get('LOGDNA_KEY', None)
    hostname = os.environ.get('LOGDNA_HOSTNAME', None)
    tags = os.environ.get('LOGDNA_TAGS', None)
    return key, hostname, tags

def decodeEvent(event):
    cw_data = str(event['awslogs']['data'])
    cw_logs = gzip.GzipFile(fileobj=StringIO(cw_data.decode('base64', 'strict'))).read()
    return json.loads(cw_logs)

def prepare(cw_log_lines, hostname=None, tags=None):
    messages = list()
    options = dict()
    app = 'CloudWatch'
    meta = {'type': app}
    if 'logGroup' in cw_log_lines:
        app = cw_log_lines['logGroup'].split('/')[-1]
        meta['group'] = cw_log_lines['logGroup'];
    if 'logStream' in cw_log_lines:
        options['hostname'] = cw_log_lines['logStream'].split('/')[-1].split(']')[-1]
        meta['stream'] = cw_log_lines['logStream']
    if hostname is not None:
        options['hostname'] = hostname
    if tags is not None:
        options['tags'] = tags
    for cw_log_line in cw_log_lines['logEvents']:
        message = {
            'line': cw_log_line['message'],
            'timestamp': cw_log_line['timestamp'],
            'file': app,
            'meta': meta}
        messages.append(sanitizeMessage(message))
    return messages, options

def sanitizeMessage(message):
    if message and message['line']:
        if len(message['line']) > MAX_LINE_LENGTH:
            message['line'] = message['line'][:MAX_LINE_LENGTH] + ' (cut off, too long...)'
    return message

def sendLog(messages, options, key=None):
    if key is not None:
        data = {'e': 'ls', 'ls': messages}
        requests.post(
            url=LOGDNA_URL,
            json=data,
            auth=('user', key),
            params={
                'hostname': options['hostname'],
                'tags': options['tags'] if 'tags' in options else None},
            stream=True,
            timeout=MAX_REQUEST_TIMEOUT)
