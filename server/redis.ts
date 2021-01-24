import redis from "redis";

const client = redis.createClient(6379, "localhost");

client.subscribe("EXEC_API");
client.subscribe("SHUTDOWN");

export { client };
