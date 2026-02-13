import { createClient } from "redis";

const redisClient = createClient({
	url: "redis://localhost:6379",
});

redisClient.on("error", (err) => {
	console.error("Redis Client Error", err);
});

export async function connectRedis() {
	if (!redisClient.isOpen) {
		await redisClient.connect();
	}
}

export async function disconnectRedis() {
	if (redisClient.isOpen) {
		await redisClient.disconnect();
	}
}

const ONLINE_USER_COUNT_HASH = "onlineUserCount";
const ONLINE_USERS_SET = "onlineUsers";

export async function addUserOnline(userId: string) {
	await connectRedis();

	// increment count
	const count = await redisClient.hIncrBy(ONLINE_USER_COUNT_HASH, userId, 1);

	// if first connection, add to set
	if (count === 1) {
		await redisClient.sAdd(ONLINE_USERS_SET, userId);
	}
}

export async function removeUserOnline(userId: string) {
	await connectRedis();

	// decrement count
	const count = await redisClient.hIncrBy(ONLINE_USER_COUNT_HASH, userId, -1);

	// if count becomes 0 or less, remove from set
	if (count <= 0) {
		await redisClient.sRem(ONLINE_USERS_SET, userId);
		await redisClient.hDel(ONLINE_USER_COUNT_HASH, userId);
	}
}

export async function getOnlineUsers(): Promise<string[]> {
	await connectRedis();
	return await redisClient.sMembers(ONLINE_USERS_SET);
}

const USER_KEYS_HASH = "userKeys";

export async function setUserPublicKey(userId: string, publicKey: string) {
	await connectRedis();
	await redisClient.hSet(USER_KEYS_HASH, userId, publicKey);
}

export async function getUserPublicKey(userId: string): Promise<string | null> {
	await connectRedis();
	return await redisClient.hGet(USER_KEYS_HASH, userId);
}

export async function removeUserPublicKey(userId: string) {
	await connectRedis();
	await redisClient.hDel(USER_KEYS_HASH, userId);
}
