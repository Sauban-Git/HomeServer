import { Server as SocketServer } from "socket.io";
import { type Server as HttpsServer } from "https";

export const setupSocket = (httpsServer: HttpsServer) => {
	const io = new SocketServer(httpsServer, {
		cors: {
			origin: "*",
		},
	});

	io.on("connection", (socket) => {
		console.log(`User with socketId: ${socket.id} connceted`);

		socket.on("disconnect", () => {
			console.log(`User: ${socket.id} disconnected`);
		});

		socket.on("message:new", (payload) => {
			console.log(`${socket.id}: ${payload.msg}`);
			if (!payload.roomId) {
				console.log("No roomId to broadcase this message");
			} else {
				io.to(payload.roomId).emit("message:new", { msg: payload.msg });
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
