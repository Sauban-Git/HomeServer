import { type Request, type Response, Router } from "express";
import { prisma } from "../../prisma/client.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
	res.json({
		message: "Will give you conversation lists",
	});
});

// NOTE: let user create new conversation
router.post("/", async (req: Request, res: Response) => {
	const payloadIn = req.body;

	try {
		const conversation = await prisma.conversation.create({
			data: {
				users: {
					connect: [
						{ phoneNumber: `${payloadIn.phoneNumber1}` },
						{ phoneNumber: `${payloadIn.phoneNumber2}` },
					],
				},
			},
			select: {
				id: true,
				createdAt: true,
				users: {
					select: {
						name: true,
						phoneNumber: true,
					},
				},
			},
		});

		if (conversation) {
			return res.status(201).json({
				conversation: conversation,
			});
		} else {
			return res.status(500).json({
				error: "couldnt create conversation try agaqin...",
			});
		}
	} catch (error) {
		console.log(`Error while creating conversation: ${error}`);
		return res.status(402).json({
			error: `Invalid credentials, Try again after some time`,
		});
	}
});

export { router as convRouter };
