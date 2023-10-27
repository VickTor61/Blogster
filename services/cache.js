const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");
let client;

(async () => {
  client = redis.createClient();

  client.on("error", (error) => console.error(`Error : ${error}`));

  await client.connect();
  client.get = util.promisify(client.get);
})();

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options || "");
  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );
  const cacheValue = await client.HGET(this.hashKey, key);
  if (cacheValue) {
    const doc = JSON.parse(cacheValue);

    return Array.isArray(doc) ? doc.map((d) => this.model(d)) : this.model(doc);
  }

  const result = await exec.apply(this, arguments);
  client.HSET(this.hashKey, key, JSON.stringify(result));
  return result;
};

const clearHash = (hashKey) => {
    client.del(JSON.stringify(hashKey))
}

module.exports = {
    clearHash
}