import request from "supertest";
import { app } from "../src/app";

describe("GET /api", () => {
	it("should return 200 and status ok", async () => {
		const res = await request(app).get("/api");
		expect(res.status).toBe(200);
	});
	it("should return 200 and some msg", async () => {
		const res = await request(app).get("/api/v1");

		expect(res.status).toBe(200);
	});
});
