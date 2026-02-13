import { prisma } from "../prisma/client.js";

export const existingConversation = async (
	userA: string,
	userB: string,
	isGroup: boolean,
) => {
	const conversation = await prisma.conversation.findFirst({
		where: {
			isGroup: isGroup,
			participants: {
				every: {
					userId: {
						in: [userA, userB],
					},
				},
			},
			AND: [
				{
					participants: {
						some: { userId: userA },
					},
				},
				{
					participants: {
						some: { userId: userB },
					},
				},
			],
		},
		include: {
			participants: true,
		},
	});
	if (conversation) {
		return { conversation, ifExist: true };
	} else {
		return { conversation: null, isExist: false };
	}
};
