import fs from "fs";
import path from "path";

export const keyPath = path.resolve(
	"/home/blue/Documents/github/HomeServer/privkey.pem",
);
export const certPath = path.resolve(
	"/home/blue/Documents/github/HomeServer/fullchain.pem",
);

export const privateKey = fs.readFileSync(
	`${process.env.PRIVATE_KEY_PATH}`,
	"utf8",
);
export const publicKey = fs.readFileSync(
	`${process.env.PUBLIC_KEY_PATH}`,
	"utf8",
);
