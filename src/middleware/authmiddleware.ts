import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { publicKey } from "../constants.js";

export const authmiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const auth = req.headers.authorization;
	if (!auth) {
		return res.status(401).json({
			error: "Invalid credentials",
		});
	}
	const token = auth?.split(" ")[1];

	if (!token) {
		return res.status(401).json({
			error: "Invalid credentials",
		});
	}

	try {
		const decoded = jwt.verify(`${token}`, `${publicKey}`);
		if (
			typeof decoded !== "object" ||
			decoded === null ||
			!("userId" in decoded)
		) {
			throw new Error("Invalid token payload");
		}

		(req as any).userId = decoded.userId;
		next();
	} catch (error) {
		return res.status(401).json({
			error: "Invalid token",
		});
	}
};
