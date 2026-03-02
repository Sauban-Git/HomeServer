import express, { json } from "express";
import { userRouter } from "../src/routes/v1/user.js";
import request from "supertest";
import { jest, describe, it, expect } from "@jest/globals";
import { prisma } from "../src/prisma/client.js";

// Create a mini Express app for testing
const app = express();
app.use(json());
app.use("/user", userRouter);

jest.mock("../src/prisma/client.js", () => ({
	prisma: {
		user: {
			findMany: jest.fn(),
			findUnique: jest.fn(),
			create: jest.fn(),
		},
	},
}));

jest.mock("../src/db/redis.js", () => ({
	setUserPublicKey: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
	sign: jest.fn(() => "fake-jwt-token"),
}));

describe("GET /user", () => {
	it("returns a list of users except current user", async () => {
		const mockUsers = [
			{ id: "2", name: "Alice", phoneNumber: "123" },
			{ id: "3", name: "Bob", phoneNumber: "456" },
		];

		// @ts-ignore
		prisma.user.findMany.mockResolvedValue(mockUsers);

		// Mock the authmiddleware to inject userId
		app.use((req, res, next) => {
			(req as any).userId = "1";
			next();
		});

		const res = await request(app).get("/user");

		expect(res.status).toBe(200);
		expect(res.body.users).toHaveLength(2);
		expect(res.body.users[0]).toHaveProperty("name", "Alice");
	});
});
