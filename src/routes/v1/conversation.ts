import { type Request, type Response, Router } from "express";
import { newConversation } from "../../utils/utils.js";
import { prisma } from "../../prisma/client.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
	try {
		const conversations = await prisma.conversation.findMany({
			where: {
				participants: {
					some: {
						userId: (req as any).userId,
					},
				},
			},
			include: {
				participants: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								phoneNumber: true,
							},
						},
					},
				},
			},
		});
		if (conversations.length !== 0) {
			return res.status(200).json({
				conversations,
			});
		} else {
			return res.status(200).json({
				error: `No conversation found`,
				conversations: null,
			});
		}
	} catch (error) {
		console.log(`Error while getting conversations: ${error}`);
		return res.status(400).json({
			error: `No conversation found`,
		});
	}
});

router.get("/:conversationId", async (req: Request, res: Response) => {
	const { conversationId } = req.params;
	if (!conversationId) {
		return res.status(401).json({
			error: "Not allowed",
		});
	}
	try {
		const conversation = await prisma.conversation.findUnique({
			where: {
				id: `${conversationId}`,
			},
			include: {
				participants: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								phoneNumber: true,
							},
						},
					},
				},
			},
		});
		if (conversation) {
			return res.status(200).json({
				conversation,
			});
		} else {
			return res.status(200).json({
				conversation: null,
				error: "Not found",
			});
		}
	} catch (error) {
		console.log(`Error while fetching single conv: ${error}`);
		return res.status(401).json({
			error: "Not allowed",
		});
	}
});

// NOTE: let user create new conversation
router.post("/", async (req: Request, res: Response) => {
	const payloadIn = req.body;
	try {
		const { conversation } = await newConversation(
			(req as any).userId,
			payloadIn.participantId,
			false,
		);
		return res.status(200).json({
			conversation,
		});
	} catch (error) {
		console.log(`Error while creating conversation: ${error}`);
		return res.status(402).json({
			error: `Invalid credentials, Try again after some time`,
		});
	}
});

// TODO: let user update goup name

export { router as convRouter };
