"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const u = require("./index");
(() => __awaiter(this, void 0, void 0, function* () {
    let redisClient = null;
    try {
        redisClient = u.ClientBuilder.withRetryStrategy();
        console.log(yield redisClient.appendAsync("12", "123"));
        yield u.sleep(3000);
        console.log(yield redisClient.setAsync("12", "456"));
        console.log(yield redisClient.getAsync("12"));
        console.log(yield redisClient.hsetAsync("a", "b", "c"));
        console.log(yield redisClient.hgetAsync("a", "b"));
    }
    catch (err) {
        console.log(err);
        console.trace(err);
    }
    finally {
        if (redisClient !== null) {
            yield redisClient.quitAsync();
        }
    }
}))();
