import https from "https";
import { app } from "./app.js";
import dotenv from "dotenv";
import { setupSocket } from "./socket.js";
import { certPath, keyPath } from "./constants.js";
import fs from "fs";

dotenv.config();

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
	const port = Number(process.env.PORT) || 3000;
	server.listen(port, "::", () => {
		console.log(`HTTPS server running on ${port}`);
	});
}

setupSocket(server);
