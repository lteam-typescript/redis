import * as u from "./index"

/*
(async () => {
    let redisClient: u.redis.RedisClient | null = null
    try {
        redisClient = u.ClientBuilder.withRetryStrategy()
        console.log(await redisClient.appendAsync("12", "123"))
        await u.sleep(3000)
        console.log(await redisClient.setAsync("12", "456"))
        console.log(await redisClient.getAsync("12"))

        console.log(await redisClient.hsetAsync("a", "b", "c"))
        console.log(await redisClient.hgetAsync("a", "b"))
    } catch (err) {
        console.log(err)
        console.trace(err)
    } finally {
        if (redisClient !== null) {
            await redisClient.quitAsync()
        }
    }
})()
*/

async function testBaseDataStructure() {
    let redisClient: u.redis.RedisClient | null = null
    try {
        redisClient = u.ClientBuilder.withRetryStrategy()

        //string
        console.log(await redisClient.setAsync("key1", "value1"))  //OK
        console.log(await redisClient.getAsync("key1"))  //value1
        console.log(await redisClient.appendAsync("key1", "1")) //7
        console.log(await redisClient.getAsync("key1"))   //value11
        console.log(await redisClient.delAsync("key1"))  //1

        //Hash
        console.log(await redisClient.hsetAsync("hash1", "field1", "value1")) // 1
        console.log(await redisClient.hgetAsync("hash1", "field1"))  // value1
        console.log(await redisClient.hgetallAsync("hash1")) // { field1: 'value1' }
        console.log(await redisClient.hdelAsync("hash1", "field1")) // 1
        console.log(await redisClient.delAsync("hash1"))  // 0

        //List
        console.log(await redisClient.lpushAsync("list1", "value1"))  // 1
        console.log(await redisClient.linsertAsync("list1", "BEFORE", "value1", "value0")) // 2
        console.log(await redisClient.lrangeAsync("list1", 0, 2)) // [ 'value0', 'value1' ]
        console.log(await redisClient.lsetAsync("list1", 0, "value00")) // OK
        console.log(await redisClient.lindexAsync("list1", 0)) // value00
        console.log(await redisClient.lpopAsync("list1")) // value00
        console.log(await redisClient.lremAsync("list1", 2, "value1")) // 1
        console.log(await redisClient.llenAsync("list1")) // 0
        console.log(await redisClient.delAsync("list1")) // 0
        
        //Set
        console.log(await redisClient.saddAsync("set1", "value0"))  // 1
        console.log(await redisClient.saddAsync("set2", "value0", "value1", "value0"))  // 2
        console.log(await redisClient.sdiffAsync("set1", "set2"))  // []
        console.log(await redisClient.sinterAsync("set1", "set2"))  // [ 'value0' ]
        console.log(await redisClient.sunionAsync("set1", "set2"))  // [ 'value1', 'value0' ]
        console.log(await redisClient.smoveAsync("set2", "set1", "value1")) // 1
        console.log(await redisClient.scardAsync( "set1")) // 2
        console.log(await redisClient.sismemberAsync( "set1", "value1")) // 1
        console.log(await redisClient.sismemberAsync( "set2", "value1")) // 0
        console.log(await redisClient.smembersAsync( "set1")) // [ 'value1', 'value0' ]
        console.log(await redisClient.delAsync("set1")) // 1
        console.log(await redisClient.delAsync("set2")) // 1

        //sorted set
        console.log(await redisClient.zaddAsync("set1", 1, "5", 2, "4", 3, "3")) // 3
        console.log(await redisClient.zrangeAsync("set1", 0, 10)) // [ '5', '4', '3' ]
        console.log(await redisClient.zremAsync("set1", "5")) // 1
        console.log(await redisClient.zremrangebyscoreAsync("set1", 2, 4)) // 2
        console.log(await redisClient.zcardAsync("set1")) // 0
        console.log(await redisClient.delAsync("set1")) // 1
    
    } catch (err) {
        console.log(err)
        console.trace(err)
    } finally {
        if (redisClient !== null) {
            await redisClient.quitAsync()
        }
    }
}

async function testSubscribe() {
    let subscriber: u.redis.RedisClient | null = null
    let publisher: u.redis.RedisClient | null = null
    try {
        subscriber = u.ClientBuilder.withRetryStrategy()
        publisher = u.ClientBuilder.withRetryStrategy()

        subscriber.on("message", function(channel, message) {
            console.log("Message: " + message + "\nChannel: " + channel + "")
        });

        console.log(await subscriber.subscribeAsync("testtest"))
        await publisher.publishAsync("testtest", "message 1 from publisher!");
        await publisher.publishAsync("testtest", "message 2 from publisher!");
        console.log(await subscriber.unsubscribeAsync("testtest"))
    } catch (err) {
        console.log(err)
        console.trace(err)
    } finally {
        if (subscriber !== null) {
            await subscriber.quitAsync()
        }
        if (publisher !== null) {
            await publisher.quitAsync()
        }
    }
    
}

async function testTransactions() {
    let redisClient: u.redis.RedisClient | null = null
    try {
        redisClient = u.ClientBuilder.withRetryStrategy()
        
        redisClient.multi([
            ["set", "a", 1],
            ["set", "b", "b"],
            ["incr", "b"],   //apparently wrong action
            ["incr", "a"]
        ]).exec((err, replay) =>{
            //no Error
            if(err) {
                console.log("Error:" + err.message)
            }
            else {
                console.log("no Error")
            }

            /**
             * OK
             * OK
             * { ReplyError: ERR value is not an integer or out of range
             *     at parseError (/scratch/git-storage/ts/redis-promise-typescript/node_modules/redis-parser/lib/parser.js:193:12)
             *     at parseType (/scratch/git-storage/ts/redis-promise-typescript/node_modules/redis-parser/lib/parser.js:303:14) code: 'ERR', command: 'INCR' }
             * 2
             */
            replay.forEach((value, index, array) => {
                console.log(value)
            })
        })

        console.log(await redisClient.getAsync("a")) // 2
        console.log(await redisClient.delAsync("a", "b")) // 2 
    } catch (err) {
        console.log(err)
        console.trace(err)
    } finally {
        if (redisClient !== null) {
            await redisClient.quitAsync()
        }
    }
}

