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

export const newConversation = async(userA: string, userB: string, isGroup: boolean) => {
  const conversation = await prisma.conversation.create({
    data: {
      isGroup: isGroup,
      participants: {
        create: [
          {user: {connect: {id: userA}}},
          {user: {connect: {id: userB}}}
        ]
      }
    },
    include: {
      participants: true
    }
  })

  return {conversation}
}
