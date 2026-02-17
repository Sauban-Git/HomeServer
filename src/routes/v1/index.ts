import { Router, type Request, type Response } from "express";
import { convRouter } from "./conversation.js";
import { msgRouter } from "./message.js";
import { userRouter } from "./user.js";
import { authmiddleware } from "../../middleware/authmiddleware.js";
const router = Router();

router.use("/user", userRouter);
router.use("/message", authmiddleware, msgRouter);
router.use("/conversation", authmiddleware, convRouter);

router.get("/", (_: Request, res: Response) => {
	res.json({
		message: "v1 routes here ... ",
	});
});

export { router as v1Router };
