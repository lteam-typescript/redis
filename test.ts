import * as u from "./index"

(async () => {
    let redisClient: u.redis.RedisClient | null = null
    try {
        redisClient = u.createClient()
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