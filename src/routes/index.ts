import { Router, type Request, type Response } from "express";
import { v1Router } from "./v1/index.js";
const router = Router();

router.get("/", (_: Request, res: Response) => {
	res.json({
		message: "api routes here ...",
	});
});

router.use("/v1", v1Router);

export { router as apiRouter };
