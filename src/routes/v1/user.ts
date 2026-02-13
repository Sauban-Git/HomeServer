import { type Request, type Response, Router } from "express";
import { prisma } from "../../prisma/client.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { privateKey } from "../../constants.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
	res.json({
		message: "Will give you user List",
	});
});

// NOTE: Create new User
router.post("/signup", async (req: Request, res: Response) => {
	const payloadIn = req.body;
	const password = payloadIn.password;

	const hash = await argon2.hash(password);
	try {
		const user = await prisma.user.create({
			data: {
				name: `${payloadIn.name}`,
				phoneNumber: `${payloadIn.phoneNumber}`,
				password: hash,
			},
			select: {
				name: true,
				phoneNumber: true,
			},
		});
		if (user) {
			return res.status(201).json({
				user: user,
			});
		}
	} catch (error) {
		return res.status(401).json({
			error: "Couldnt register... try AGAIN",
		});
	}
});

// FIX: let socketio to use jwt ...
router.post("/signin", async (req: Request, res: Response) => {
	const payloadIn = req.body;
	const password = payloadIn.password;
	try {
		const user = await prisma.user.findUnique({
			where: {
				phoneNumber: `${payloadIn.phoneNumber}`,
			},
		});
		if (user) {
			const isValid = await argon2.verify(user.password, password);
			if (isValid) {
				const data = { userId: user.id };
				const token = jwt.sign(data, privateKey, {
					algorithm: "RS256",
					expiresIn: "7d",
				});
				return res.status(201).json({
					user: { name: user.name, phoneNumber: user.phoneNumber },
					token: token,
				});
			} else {
				return res.status(401).json({
					error: "Invalid credentials",
				});
			}
		}
	} catch (error) {
		return res.status(401).json({
			error: "Invalid credentials",
		});
	}
});

// TODO: let user update phone number name and password

export { router as userRouter };
