import exporess, { type Request, type Response } from "express";
import { apiRouter } from "./routes/index.js";

export const app = exporess();

app.use(exporess.json());

app.use("/api", apiRouter);

app.get("/", (_: Request, res: Response) => {
	res.json({
		message: "You reached me successfully... no issue",
	});
});
