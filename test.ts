import * as u from "./index"

(async () => {
    let redisClient: u.redis.RedisClient | null = null
    try {
        redisClient = u.createClient()
        console.log(await redisClient.appendAsync("12", "455"))
        await u.sleep()
        console.log(await redisClient.appendAsync("12", "455"))
        console.log(await redisClient.getAsync("12"))
    } catch (err) {
        console.log(err)
        console.trace(err)
    } finally {
        if (redisClient !== null) {
            await redisClient.quitAsync()
        }
    }
})()