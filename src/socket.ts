import { Server as SocketServer } from "socket.io";
import { type Server as HttpsServer } from "https";
import jwt from "jsonwebtoken";
import { publicKey } from "./constants.js";
import {
	addUserOnline,
	getOnlineUsers,
	getUserPublicKey,
	removeUserOnline,
	setUserPublicKey,
} from "./db/redis.js";

type PublicKeyStore = Map<string, string>;

export const setupSocket = (httpsServer: HttpsServer) => {
	// NOTE: storing public key
	const publicKeys: PublicKeyStore = new Map();

	const io = new SocketServer(httpsServer, {
		cors: {
			origin: "*",
		},
	});

	// NOTE: for middleware to jwt
	io.use((socket, next) => {
		const authHeader = socket.handshake.headers.authorization;

		if (!authHeader) {
			return next(new Error("Authorization header missing"));
		}

		const parts = authHeader.split(" ");

		if (parts.length !== 2 || parts[0] !== "Bearer") {
			return next(new Error("Invalid Authorization format"));
		}

		const token = parts[1];

		try {
			const decoded = jwt.verify(`${token}`, `${publicKey}`);
			if (
				typeof decoded !== "object" ||
				decoded === null ||
				!("userId" in decoded)
			) {
				throw new Error("Invalid token payload");
			}
			socket.data.userId = decoded.userId;
			next();
		} catch (err) {
			return next(new Error("Invalid or expired token"));
		}
	});

	io.on("connection", async (socket) => {
		console.log(`User connected with userId: ${socket.data.userId}`);

		socket.on("disconnect", async () => {
			console.log(`User: ${socket.data.userId} disconnected`);
			publicKeys.delete(socket.data.userId);
			await removeUserOnline(socket.data.userId);
		});

		socket.on("e2ee:register-key", async ({ publicKey }) => {
			publicKeys.set(socket.data.userId, publicKey);
			await setUserPublicKey(socket.data.userId, publicKey);
			console.log(`Stored public key for ${socket.data.userId}`);
		});

		socket.on("e2ee:get-key", async ({ userId }, callback) => {
			const key = publicKeys.get(userId);
			const key1 = await getUserPublicKey(userId);
			callback(key1 || key || null);
		});

		socket.on("message:new", (payload) => {
			console.log(`Encrypted msg from ${socket.data.userId}: ${payload.msg}`);
			if (!payload.roomId) {
				console.log("No roomId to broadcase this message");
			} else {
				io.to(payload.roomId).emit("message:new", {
					msg: payload.msg,
					iv: payload.iv,
					senderId: socket.data.userId,
				});
			}
		});

		// NOTE: for future reply on 1 msg.. i dont know yet .. how to imnplement this one.. will see it later
		socket.on("message:reply", (payload) => {
			console.log(`reply to: ${payload.orgMsg} \n ${payload.msg}`);
		});

		socket.on("conversation:join", async (payload) => {
			socket.join(payload.roomId);
			io.to(payload.roomId).emit("user:new", { userId: socket.data.userId });

			// NOTE: if slow in redis ..then remove await.. onlineuserlist will be delayed but socket will be faster
			await addUserOnline(socket.data.userId);
			const onlineUsers = await getOnlineUsers();
			io.to(payload.roomId).emit("online:users", onlineUsers);
			console.log(
				`User: ${socket.data.userId} joined room: ${payload.roomId} `,
			);
		});
	});

	return io;
};
