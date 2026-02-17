import { type Request, type Response, Router } from "express";
import { existingConversation, newConversation } from "../../utils/utils.js";
import { prisma } from "../../prisma/client.js";

const router = Router();

router.get("/", async(req: Request, res: Response) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            id: (req as any).userId
          }
        }
      },
      include: {
        participants: true
      }
    })
    if (conversations.length !== 0) {
      return res.status(200).json({
        conversations
      })
    }else {
      return res.status(200).json({
        error: `No conversation found`,
        conversations: null
      })
    }
  } catch (error) {
    console.log(`Error while getting conversations: ${error}`)
    return res.status(400).json({
      error: `No conversation found`
    })
  }
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
			const {conversation} = await newConversation((req as any).userId, payloadIn.participantId, false)
      return res.status(201).json({
        conversation,
      })
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
