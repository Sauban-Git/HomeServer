import { type Request, type Response, Router } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
	res.json({
		message: "Will give you user List",
	});
});

// NOTE: Create new User
router.post("/", (req: Request, res: Response) => {
	const payloadIn = req.body;
});

export { router as userRoouter };
