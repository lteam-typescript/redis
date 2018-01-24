"use strict";
// https://github.com/Microsoft/TypeScript/issues/8685
Object.defineProperty(exports, "__esModule", { value: true });
const bb = require("bluebird");
const redis = require("redis");
exports.redis = redis;
var ClientBuilder;
(function (ClientBuilder) {
    function withOption(options) {
        const oldRedisClient = redis.createClient(options);
        return bb.promisifyAll(oldRedisClient); // cast
    }
    ClientBuilder.withOption = withOption;
    function withRetryStrategy(port = 6379, host = "127.0.0.1", MAX_ATTEMPT = -1, MAX_RETRY_TIME_IN_MILLIS = -1, QUIT_IF_ECONNREFUSED = false) {
        return withOption({
            port,
            host,
            retry_strategy: function (options) {
                if (QUIT_IF_ECONNREFUSED) {
                    if (options.error && options.error.code === 'ECONNREFUSED') {
                        // End reconnecting on a specific error and flush all commands with a individual error
                        return new Error('The server refused the connection');
                    }
                }
                if (MAX_RETRY_TIME_IN_MILLIS > 0) {
                    if (options.total_retry_time > MAX_RETRY_TIME_IN_MILLIS) {
                        // End reconnecting after a specific timeout and flush all commands with a individual error
                        return new Error('Retry time exhausted');
                    }
                }
                if (MAX_ATTEMPT > 0) {
                    if (options.attempt > MAX_ATTEMPT) {
                        // End reconnecting with built in error
                        return new Error("Connection attempts exhausted");
                    }
                }
                // reconnect after
                return Math.min(options.attempt * 100, 3000);
            }
        });
    }
    ClientBuilder.withRetryStrategy = withRetryStrategy;
})(ClientBuilder = exports.ClientBuilder || (exports.ClientBuilder = {}));
function sleep(sleepIntervalInMillis = 5000) {
    return new Promise((r) => {
        setTimeout(() => r(), sleepIntervalInMillis);
    });
}
exports.sleep = sleep;
