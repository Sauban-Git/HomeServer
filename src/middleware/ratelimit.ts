import rateLimit from "express-rate-limit";
// Limit to 5 login attempts per 15 minutes per IP
export const signinLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // limit each IP to 5 requests per windowMs
	message: {
		error: "Too many login attempts. Please try again after 15 minutes.",
	},
	standardHeaders: true, // Return rate limit info in headers
	legacyHeaders: false, // Disable X-RateLimit-* headers
});
