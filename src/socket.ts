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
	});

	return io;
};
