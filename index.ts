// https://github.com/Microsoft/TypeScript/issues/8685

import * as bb from 'bluebird'
import * as redis from 'redis'

export function createClient(options?: redis.ClientOpts | undefined) {
    const oldRedisClient = redis.createClient(options)
    return bb.promisifyAll(oldRedisClient) as redis.RedisClient; // cast
}

export namespace ClientBuilder{

    export function withRetryStrategy(
        port: number = 6379,
        host: string = "127.0.0.1",
        MAX_ATTEMPT: number = -1,
        MAX_RETRY_TIME_IN_MILLIS = -1,
        QUIT_IF_ECONNREFUSED = false
    ) {
        return createClient({
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

}

export function sleep(sleepIntervalInMillis: number = 5000) {
    return new Promise((r) => {
        setTimeout(() => r(), sleepIntervalInMillis)
    })
}

declare module 'redis' {

    export interface OverloadedCommandAsync<T, U> {
        (arg1: T, arg2: T, arg3: T, arg4: T, arg5: T, arg6: T): Promise<U>;
        (arg1: T, arg2: T, arg3: T, arg4: T, arg5: T): Promise<U>;
        (arg1: T, arg2: T, arg3: T, arg4: T): Promise<U>;
        (arg1: T, arg2: T, arg3: T): Promise<U>;
        (arg1: T, arg2: T | T[]): Promise<U>; // Notice, only diff from OverloadedListCommandAsync
        (arg1: T | T[]): Promise<U>;
        (...args: Array<T>): Promise<U>;
    }

    export interface OverloadedKeyCommandAsync<T, U> {
        (key: string, arg1: T, arg2: T, arg3: T, arg4: T, arg5: T, arg6: T): Promise<U>;
        (key: string, arg1: T, arg2: T, arg3: T, arg4: T, arg5: T): Promise<U>;
        (key: string, arg1: T, arg2: T, arg3: T, arg4: T): Promise<U>;
        (key: string, arg1: T, arg2: T, arg3: T): Promise<U>;
        (key: string, arg1: T, arg2: T): Promise<U>;
        (key: string, arg1: T | T[]): Promise<U>;
        (key: string, ...args: Array<T>): Promise<U>;
        (...args: Array<string | T>): Promise<U>;
    }

    export interface OverloadedListCommandAsync<T, U> {
        (arg1: T, arg2: T, arg3: T, arg4: T, arg5: T, arg6: T): Promise<U>;
        (arg1: T, arg2: T, arg3: T, arg4: T, arg5: T): Promise<U>;
        (arg1: T, arg2: T, arg3: T, arg4: T): Promise<U>;
        (arg1: T, arg2: T, arg3: T): Promise<U>;
        (arg1: T, arg2: T): Promise<U>;
        (arg1: T | T[]): Promise<U>;
        (...args: Array<T>): Promise<U>;
    }


    export interface RedisClient extends NodeJS.EventEmitter {

        monitorAsync(): Promise<undefined>;

        infoAsync(): Promise<ServerInfo>;
        infoAsync(section?: string | string[]): Promise<ServerInfo>;

        pingAsync(): Promise<string>;
        pingAsync(message: string): Promise<string>;

        publishAsync(channel: string, value: string): Promise<number>;

        authAsync(password: string): Promise<string>;

        subscribeAsync: OverloadedListCommandAsync<string, string>;
        unsubscribeAsync: OverloadedListCommandAsync<string, string>;
        psubscribeAsync: OverloadedListCommandAsync<string, string>;
        punsubscribeAsync: OverloadedListCommandAsync<string, string>;

        appendAsync(key: string, value: string): Promise<Number>

        evalshaAsync: OverloadedCommandAsync<string | number, any>;
        existsAsync: OverloadedCommandAsync<string, number>

        expireAsync(key: string, seconds: number): Promise<number>
        expireatAsync(key: string, timestamp: number): Promise<number>

        getAsync(key: string): Promise<String>

        getbitAsync(key: string, offset: number): Promise<number>

        getrangeAsync(key: string, start: number, end: number): Promise<string>
        getsetAsync(key: string, value: string): Promise<string>

        // h series function for hash

        hdelAsync: OverloadedKeyCommandAsync<string, number>

        hexistsAsync(key: string, field: string): Promise<number>

        hgetAsync(key: string, field: string): Promise<string>
        hgetallAsync(key: string): Promise<{ [key: string]: string }>

        hincrbyfloatAsync(key: string, field: string, increment: number): Promise<number>;

        hkeysAsync(key: string): Promise<string[]>

        hlenAsync(key: string): Promise<number>

        hsetAsync(key: string, field: string, value: string): Promise<number>
        hsetnxAsync(key: string, field: string, value: string): Promise<number>

        hstrlenAsync(key: string, field: string): Promise<number>
        hvalsAsync(key: string): Promise<string[]>


        selectAsync(index: number | string): Promise<string>;

        /**
         * Set the string value of a key.
         */
        setAsync(key: string, value: string): Promise<'OK'>;
        setAsync(key: string, value: string, flag: string): Promise<'OK'>;
        setAsync(key: string, value: string, mode: string, duration: number): Promise<'OK'>;
        setAsync(key: string, value: string, mode: string, duration: number, flag: string): Promise<'OK'>;

        setbitAsync(key: string, offset: number, value: string): Promise<number>

        setexAsync(key: string, seconds: number, value: string): Promise<string>;
        setnxAsync(key: string, value: string): Promise<number>;

        setrangeAsync(key: string, offset: number, value: string): Promise<number>;

        // r series for list operation
        rpopAsync(key: string): Promise<string>
        rpoplpushAsync(source: string, destination: string): Promise<string>

        rpushAsync: OverloadedKeyCommandAsync<string, number>;
        rpushxAsync(key: string, value: string): Promise<number>;


        quitAsync(): Promise<'OK'>;
    }
}

export { redis }
