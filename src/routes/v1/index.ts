import { Router, type Request, type Response } from "express";
import { userRoouter } from "./user.js";
import { convRouter } from "./conversation.js";
import { msgRouter } from "./message.js";
const router = Router();

router.use("/user", userRoouter);
router.use("/message", msgRouter);
router.use("/conversation", convRouter);

router.get("/", (req: Request, res: Response) => {
	res.json({
		message: "v1 routes here ... ",
	});
});

export { router as v1Router };
