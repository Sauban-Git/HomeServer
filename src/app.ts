import exporess, { type Request, type Response } from "express";

export const app = exporess();

app.use(exporess.json());

app.get("/", (req: Request, res: Response) => {
	res.json({
		message: "You reached me successfully... no issue",
	});
});
