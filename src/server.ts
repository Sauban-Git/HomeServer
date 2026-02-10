import https from "https";
import fs from "fs";
import path from "path";
import { app } from "./app.js";
import dotenv from "dotenv";
import { setupSocket } from "./socket.js";
dotenv.config();

const port = Number(process.env.PORT) || 3786; // your app port

const keyPath = path.resolve(
	"/home/blue/Documents/github/HomeServer/privkey.pem",
);
const certPath = path.resolve(
	"/home/blue/Documents/github/HomeServer/fullchain.pem",
);

const options: https.ServerOptions = {
	key: fs.readFileSync(keyPath),
	cert: fs.readFileSync(certPath),
	minVersion: "TLSv1.3",
	ciphers: [
		"ECDHE-ECDSA-AES256-GCM-SHA384",
		"ECDHE-RSA-AES256-GCM-SHA384",
		"ECDHE-ECDSA-AES128-GCM-SHA256",
		"ECDHE-RSA-AES128-GCM-SHA256",
	].join(":"),
	honorCipherOrder: true,
};

const server = https.createServer(options, app);

// systemd socket activation check
if (process.env.LISTEN_FDS === "1") {
	// fd 3 is the inherited socket
	server.listen({ fd: 3 });
	console.log("HTTPS server started via systemd socket (fd 3)");
} else {
	// fallback (local/dev)
	const port = Number(process.env.PORT) || 3786;
	server.listen(port, "::", () => {
		console.log(`HTTPS server running on ${port}`);
	});
}

setupSocket(server);
