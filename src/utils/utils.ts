import { prisma } from "../prisma/client.js";

export const existingConversation = async (
	userA: string,
	userB: string,
	isGroup: boolean,
) => {
	if (isGroup) return { isExist: false, conversation: null };
	const hash = [userA, userB].sort().join("_");
	try {
		const conversation = await prisma.conversation.findUnique({
			where: {
				participantHash: hash,
			},
		});
		if (conversation) {
			return { conversation, ifExist: true };
		} else {
			return { conversation: null, isExist: false };
		}
	} catch (error) {
		console.log(`Error while checking conv: `, error);
		return { isExist: false, conversation: null };
	}
};

export const newConversation = async (
	userA: string,
	userB: string,
	isGroup: boolean,
) => {
	const { isExist, conversation } = await existingConversation(
		userA,
		userB,
		isGroup,
	);
	if (isExist) return { conversation };

	const hash = [userA, userB].sort().join("_");
	try {
		const conversation = await prisma.conversation.create({
			data: {
				isGroup: isGroup,
				participantHash: hash,
				participants: {
					create: [
						{ user: { connect: { id: userA } } },
						{ user: { connect: { id: userB } } },
					],
				},
			},
			include: {
				participants: true,
			},
		});
		if (conversation) {
			return { conversation };
		} else {
			return { conversation: null };
		}
	} catch (error) {
		console.log(`Error while new conv: `, error);
		return { conversation: null };
	}
};
