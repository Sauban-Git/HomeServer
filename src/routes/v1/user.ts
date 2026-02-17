import { type Request, type Response, Router } from "express";
import { prisma } from "../../prisma/client.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { privateKey } from "../../constants.js";
import { authmiddleware } from "../../middleware/authmiddleware.js";
import { setUserPublicKey } from "../../db/redis.js";
import { signinLimiter } from "../../middleware/ratelimit.js";

const router = Router();

router.get("/", async (_: Request, res: Response) => {
	try {
		const users = await prisma.user.findMany({
			where: {},
			select: {
				name: true,
				id: true,
				phoneNumber: true,
			},
		});
		if (users) {
			res.status(201).json({
				users: users,
			});
		}
	} catch (error) {
		return res.status(401).json({
			error: "Invalid credentials",
		});
	}
});

// NOTE: for getting info like name phoneNumber etc...
router.get("/info", authmiddleware, async (req: Request, res: Response) => {
	const userId = (req as any).userId;
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: userId,
			},
			select: {
				name: true,
				id: true,
				phoneNumber: true,
			},
		});
		if (user) {
			return res.status(201).json({
				user: user,
			});
		} else {
			return res.status(401).json({
				error: "Invalid credentials",
			});
		}
	} catch (error) {
		return res.status(401).json({
			error: "Invalid credentials",
		});
	}
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
				id: true,
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

// NOTE: Signin
router.post("/signin", signinLimiter, async (req: Request, res: Response) => {
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

				await setUserPublicKey(user.id, payloadIn.publicKey);
				return res.status(201).json({
					user: {
						id: user.id,
						name: user.name,
						phoneNumber: user.phoneNumber,
					},
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
