import { type Request, type Response, Router } from "express";
import { prisma } from "../../prisma/client.js";
import { existingConversation } from "../../utils/utils.js";

const router = Router();

// HACK: Dont let user hit this.. normal users shouldnt hit this route
router.get("/", (req: Request, res: Response) => {
	res.json({
		message: "Will give you conversation lists",
	});
});

// NOTE: let user create new conversation
router.post("/", async (req: Request, res: Response) => {
	const payloadIn = req.body;

	try {
		const { conversation, ifExist } = await existingConversation(
			payloadIn.userA,
			payloadIn.userB,
			false,
		);
		if (ifExist) {
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

// TODO: let user update goup name

export { router as convRouter };
