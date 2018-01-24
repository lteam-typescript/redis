# promisify-redis
Provide typescript and promisify redis wrapper

```
npm install git+https://github.com/lteam18/redis-promise-typescript.git
```

# Create a redis client with retry strategy

```

```

## A sample usage

```typescript
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
```

# Yet another more advanced library `handy-client`


`https://github.com/mmkal/handy-redis` is a remarkable. The codes and tests are auto generated.


但是，考虑到如下几点：
1. `handy-redis`维护代价较高
2. `handy-redis`采用的是自造`promisify-all`，而我们采用的则是维护更好的`bludbird.promisifyAll`
3. 我们这种手写typedef的上述问题相对而言并不大，而且技术简单文件少，反而不容易出错。
  1. 也许会跟不上最新client变化 - 幸好redis已经很稳定了
  2. 也许会出现def错误 - 不断维护即可，这种问题是有限的

因此，综上，我们决定坚持使用并维护`promisify-redis`，虽然我们非常钦佩`handy-redis`的技术含量

