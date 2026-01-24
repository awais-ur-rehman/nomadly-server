import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../../users/models/user.model";
import { Otp } from "../models/otp.model";
import {
  UnauthorizedError,
  ValidationError,
  ConflictError,
} from "../../../utils/errors";
import { logger } from "../../../utils/logger";
import { sendOtpEmail } from "../../../utils/email";

export class AuthService {
  async register(
    email: string,
    password: string,
    name: string,
    phone?: string,
    age?: number,
    gender?: string
  ) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError("Email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      email: email.toLowerCase(),
      password_hash: passwordHash,
      phone: phone,
      profile: {
        name: name,
        age: age,
        gender: gender,
        hobbies: [],
        intent: "friends",
      },
      rig: {
        type: "suv",
        crew_type: "solo",
        pet_friendly: false,
      },
      is_builder: false,
      nomad_id: {
        verified: false,
        member_since: new Date(),
        vouch_count: 0,
      },
      subscription: {
        status: "expired",
        plan: "free",
      },
      is_active: false,
    });

    await this.sendOtp(email);

    return {
      userId: user._id.toString(),
      email: user.email,
      isActive: user.is_active,
    };
  }

  async sendOtp(email: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.create({
      email: email.toLowerCase(),
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    try {
      await sendOtpEmail(email, code);
    } catch (error) {
      logger.error({ error }, "Failed to send OTP email");
      throw new Error("Failed to send OTP email");
    }
  }

  async verifyOtp(email: string, code: string) {
    const otp = await Otp.findOne({
      email: email.toLowerCase(),
      code,
      expiresAt: { $gt: new Date() },
    });

    if (!otp) {
      throw new ValidationError("Invalid or expired OTP code");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    user.is_active = true;
    await user.save();

    await Otp.deleteOne({ _id: otp._id });

    const tokens = this.generateTokens({
      userId: user._id.toString(),
      email: user.email,
    });

    return {
      ...tokens,
      user: {
        id: user._id.toString(),
        email: user.email,
        isActive: user.is_active,
      },
    };
  }

  async login(email: string, password: string) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (!user.is_active) {
      throw new UnauthorizedError("Account not activated. Please verify your email.");
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const tokens = this.generateTokens({
      userId: user._id.toString(),
      email: user.email,
    });

    return {
      ...tokens,
      user: {
        id: user._id.toString(),
        email: user.email,
        isActive: user.is_active,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const jwtSecret = process.env.REFRESH_TOKEN_SECRET;
      if (!jwtSecret) {
        throw new Error("REFRESH_TOKEN_SECRET is not defined");
      }

      const payload = jwt.verify(refreshToken, jwtSecret) as {
        userId: string;
      };

      const user = await User.findById(payload.userId);
      if (!user) {
        throw new UnauthorizedError("User not found");
      }

      const token = this.generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
      });

      return { token };
    } catch (error) {
      throw new UnauthorizedError("Invalid refresh token");
    }
  }

  private generateTokens(payload: { userId: string; email: string }) {
    return {
      token: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  private generateAccessToken(payload: { userId: string; email: string }): string {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined");
    }

    return jwt.sign(payload, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
  }

  private generateRefreshToken(payload: { userId: string }): string {
    const jwtSecret = process.env.REFRESH_TOKEN_SECRET;
    if (!jwtSecret) {
      throw new Error("REFRESH_TOKEN_SECRET is not defined");
    }

    return jwt.sign(payload, jwtSecret, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "30d",
    });
  }
}
