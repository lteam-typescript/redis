## How to develop

### Start Redis

```
docker run -d --name redis -p 6379:6379 redis
```

You could try redis with

```
docker exec -it redis redis-cli
```

### Test

Now you could test your code with it.

```
ts-node test.ts
```
