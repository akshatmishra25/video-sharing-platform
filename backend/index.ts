import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "./db";

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const PORT = process.env.PORT || 3000;

// Middleware to extract user ID from JWT token
function getUserId(req: express.Request): string | null {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return null;
    try {
        const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { userId: string };
        return payload.userId;
    } catch(error) {
        console.log("got error: "+error);
        return null;
    }
}

// Validation schemas
const signupSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
    gender: z.enum(["Male", "Female", "Other"]),
    channelName: z.string().min(1),
});

const signinSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
});

const postVideoSchema = z.object({
    title: z.string().min(1),
    videoUrl: z.string().url(),
    thumbnail: z.string().url(),
});

// ============ AUTH ENDPOINTS ============

// SIGN UP
app.post("/api/signup", async (req, res) => {
    try {
        const body = signupSchema.parse(req.body);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { username: body.username },
        });

        if (existingUser) {
            res.status(400).json({ error: "User already exists" });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(body.password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                username: body.username,
                password: hashedPassword,
                gender: body.gender,
                channelName: body.channelName,
            },
        });

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET);

        res.status(201).json({
            message: "User created successfully",
            token,
            user: {
                id: user.id,
                username: user.username,
                channelName: user.channelName,
                gender: user.gender,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.errors });
        } else {
            console.log("Following error is coming"+error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
});

// SIGN IN
app.post("/api/signin", async (req, res) => {
    try {
        const body = signinSchema.parse(req.body);

        // Find user
        const user = await prisma.user.findUnique({
            where: { username: body.username },
        });

        if (!user) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(body.password, user.password);

        if (!isValidPassword) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET);

        res.status(200).json({
            message: "Signed in successfully",
            token,
            user: {
                id: user.id,
                username: user.username,
                channelName: user.channelName,
                gender: user.gender,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.errors });
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});

// ============ VIDEO ENDPOINTS ============

// GET ALL VIDEOS
app.get("/api/videos", async (_req, res) => {
    try {
        const videos = await prisma.uploads.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        channelName: true,
                        profilePicture: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.status(200).json({
            message: "Videos fetched successfully",
            videos,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch videos" });
    }
});

// GET ONE VIDEO
app.get("/api/videos/:id", async (req, res) => {
    try {
        const video = await prisma.uploads.findUnique({
            where: { id: req.params.id },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        channelName: true,
                        gender: true,
                    }
                }
            }
        });

        if(!video) {
            res.status(404).json({ error: "Video not found"});
            return;
        }
        res.json(video);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch videos" });
    }
});

// POST VIDEO (Create/Upload)
app.post("/api/videos", async (req, res) => {
    try {
        console.log("Entered upload logic");
        console.log("Request body:", req.body);
        // Check if user is authenticated
        const userId = getUserId(req);
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const body = postVideoSchema.parse(req.body);

        // Create video
        const video = await prisma.uploads.create({
            data: {
                title: body.title,
                videoUrl: body.videoUrl,
                thumbnail: body.thumbnail,
                slug: body.title.toLowerCase().replace(/\s+/g, "-"),
                userId: userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        channelName: true,
                    },
                },
            },
        });

        res.status(201).json({
            message: "Video uploaded successfully",
            video,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.log("Zod validation error:", error.errors);
            res.status(400).json({ error: error.errors });
        } else {
            console.log("Upload error:", error);
            res.status(500).json({ error: "Failed to upload video" });
        }
    }
});

// ============ FEED ENDPOINT ============

// GET FEED (Feed for authenticated user)
app.get("/api/feed", async (req, res) => {
    try {
        // Check if user is authenticated
        const userId = getUserId(req);
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        // Get all videos excluding user's own videos
        const feed = await prisma.uploads.findMany({
            where: {
                userId: {
                    not: userId,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        channelName: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.status(200).json({
            message: "Feed fetched successfully",
            videos: feed,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch feed" });
    }
});

// ============ HEALTH CHECK ============

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ message: "Server is running" });
});

// ============ SERVER START ============

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
