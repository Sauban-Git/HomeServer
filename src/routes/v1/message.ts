import { type Request, type Response, Router } from "express";

const router = Router();

router.get("/", (_: Request, res: Response) => {
	res.json({
		message: "Will give you message List",
	});
});

// NOTE: let user create new message or send message + now db here + only encrypted message sent using websocker
router.post("/", async (req: Request, res: Response) => {});

export { router as msgRouter };
