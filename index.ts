// https://github.com/Microsoft/TypeScript/issues/8685

import * as bb from 'bluebird'
import * as redis from 'redis'

export function createClientWithOption(options: {}) {
    const oldRedisClient = redis.createClient(options)
    return bb.promisifyAll(oldRedisClient) as redis.RedisClient; // cast
}

export function createClient(
    port: number = 6379,
    host: string = "127.0.0.1",
    MAX_ATTEMPT: number = -1,
    MAX_RETRY_TIME_IN_MILLIS = -1,
    QUIT_IF_ECONNREFUSED = false
) {
    return createClientWithOption({
        port,
        host,
        retry_strategy: function(options: any) {
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
                    return new Error("Connection attempts exhausted")
                }
            }
            // reconnect after
            return Math.min(options.attempt * 100, 3000);
        }
    });
}


export function sleep(sleepIntervalInMillis: number = 5000) {
    return new Promise((r) => {
        setTimeout(() => r(), sleepIntervalInMillis)
    })
}

declare module 'redis' {
    export interface RedisClient extends NodeJS.EventEmitter {
        appendAsync(key: string, value: string): Promise<Number>;
        getAsync(key: string): Promise<String>;

        select(index: number | string): Promise<string>;
    
        /**
         * Set the string value of a key.
         */
        setAsync(key: string, value: string): Promise<'OK'>;
        setAsync(key: string, value: string, flag: string): Promise<'OK'>;
        setAsync(key: string, value: string, mode: string, duration: number): Promise<'OK'>;
        setAsync(key: string, value: string, mode: string, duration: number, flag: string): Promise<'OK'>;


        quitAsync(): Promise<'OK'>;
    }
}

export { redis }
