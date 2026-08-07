import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";

const registerSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export async function register(req: Request, res: Response) {
  const { name, email, password } = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists", "email_taken");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      subscription: {
        create: {
          plan: "monthly",
          status: "trialing",
          trialEndsAt: addDays(new Date(), 30),
          childrenIncluded: 1,
        },
      },
    },
  });

  const token = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id, email: user.email });

  res.status(201).json({ token, refreshToken, userId: user.id, email: user.email, name: user.name });
}

export async function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw ApiError.unauthorized("Incorrect email or password", "invalid_credentials");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized("Incorrect email or password", "invalid_credentials");
  }

  const token = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id, email: user.email });

  res.status(200).json({ token, refreshToken, userId: user.id, email: user.email });
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = refreshSchema.parse(req.body);

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token", "invalid_refresh_token");
  }

  const token = signAccessToken({ sub: payload.sub, email: payload.email });
  res.status(200).json({ token });
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}
