// External Libraries
const zlib = require('zlib');

// Parse the GZipped Log Data
const parseEvents = (event) => {
    return JSON.parse(zlib.unzipSync(Buffer.from(event.awslogs.data, 'base64')));
};

// Prepare the Messages and Options
exports.createLogs = (events) => {
    const parsedEvents = parseEvents(events);
    return parsedEvents.logEvents.map((event) => {

        return {
            line: JSON.stringify({
                message: event.message
                , source: 'cloudwatch'
                , event: {
                    type: parsedEvents.messageType
                    , id: event.id
                }
                , log: {
                    group: parsedEvents.logGroup
                    , stream: parsedEvents.logStream
                }
            })
            , timestamp: event.timestamp
            , file: parsedEvents.logStream
            , meta: {
                owner: parsedEvents.owner
                , filters: parsedEvents.subscriptionFilters
            }
        };
    });
};
