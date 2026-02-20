import { type Request, type Response, Router } from "express";

const router = Router();

router.get("/", (_: Request, res: Response) => {
	res.json({
		message: "Will give you message List",
	});
});

// NOTE: let user create new message or send message + no db here + only encrypted message sent using websocker

export { router as msgRouter };
