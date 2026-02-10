import { type Request, type Response, Router } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
	res.json({
		message: "Will give you message List",
	});
});

export { router as msgRouter };
