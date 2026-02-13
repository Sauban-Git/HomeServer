import { Server as SocketServer } from "socket.io";
import { type Server as HttpsServer } from "https";

type PublicKeyStore = Map<string, string>;

export const setupSocket = (httpsServer: HttpsServer) => {
	const io = new SocketServer(httpsServer, {
		cors: {
			origin: "*",
		},
	});

	const publicKeys: PublicKeyStore = new Map();

	io.on("connection", (socket) => {
		console.log(`User with socketId: ${socket.id} connceted`);

		socket.on("disconnect", () => {
			console.log(`User: ${socket.id} disconnected`);
			publicKeys.delete(socket.id);
		});

		socket.on("e2ee:register-key", ({ publicKey }) => {
			publicKeys.set(socket.id, publicKey);
			console.log(`Stored public key for ${socket.id}`);
		});

		socket.on("e2ee:get-key", ({ userId }, callback) => {
			const key = publicKeys.get(userId);
			callback({ publicKey: key || null });
		});

		socket.on("message:new", (payload) => {
			console.log(`Encrypted msg from ${socket.id}: ${payload.msg}`);
			if (!payload.roomId) {
				console.log("No roomId to broadcase this message");
			} else {
				io.to(payload.roomId).emit("message:new", {
					msg: payload.msg,
					encryptedKey: payload.encryptedKey,
					iv: payload.ii,
				});
			}
		});

		socket.on("message:reply", (payload) => {
			console.log(`reply to: ${payload.orgMsg} \n ${payload.msg}`);
		});

		socket.on("conversation:join", (payload) => {
			socket.join(payload.roomId);
			io.to(payload.roomId).emit("user:new", { userId: socket.id });
			console.log(`User: ${socket.id} joined room: ${payload.roomId} `);
		});
	});

	return io;
};
