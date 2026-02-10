import jwt, { type SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../../users/models/user.model";
import {
  UnauthorizedError,
  ValidationError,
  ConflictError,
  NotFoundError,
} from "../../../utils/errors";
import { logger } from "../../../utils/logger";
import { sendOtpEmail } from "../../../utils/email";
import { storeOtp, getOtp, deleteOtp } from "../../../config/redis";
import { InviteService } from "../../invite/services/invite.service";

export class AuthService {
  async register(
    email: string,
    password: string,
    username: string,
    name: string,
    phone?: string,
    age?: number,
    gender?: string,
    inviteCode?: string
  ) {
    // Validate invite code FIRST before creating anything
    const inviteService = new InviteService();
    if (!inviteCode) {
      throw new ValidationError("Invite code is required to join Nomadly");
    }
    await inviteService.validateCode(inviteCode);

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      throw new ConflictError("Email already exists");
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      throw new ConflictError("Username already taken");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password_hash: passwordHash,
      phone: phone,
      is_private: false,
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

    // Redeem the invite code and link the inviter
    const inviterId = await inviteService.redeemCode(inviteCode, user._id.toString());
    user.invited_by = inviterId;
    await user.save();

    try {
      await this.sendOtp(email);
    } catch (error) {
      // If OTP sending fails, rollback user creation so they can try again
      logger.error({ error, userId: user._id }, "Failed to send OTP, rolling back user creation");

      // Refund invite usage
      try {
        // Use decrementUsage instead of revokeCode to keep the invite valid for others
        await inviteService.decrementUsage(inviteCode, user._id.toString());

        await User.findByIdAndDelete(user._id);
      } catch (cleanupError) {
        logger.error({ cleanupError }, "Failed to rollback user creation");
      }

      throw new Error("Failed to send verification email. Please check your email settings or try again.");
    }

    return {
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      isActive: user.is_active,
      requiresVerification: true,
      invited_by: inviterId,
    };
  }

  async sendOtp(email: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Redis with 5-minute TTL (handled by storeOtp)
    await storeOtp(email, code);

    try {
      await sendOtpEmail(email, code);
      // logger.info({ email }, "OTP sent successfully");
    } catch (error) {
      // Log connection details for debugging
      const isTimeout = (error as any).code === 'ETIMEDOUT';
      logger.error({ error, email, isTimeout }, "Failed to send OTP email");
      throw error;
    }
  }

  async verifyOtp(email: string, code: string) {
    // Get OTP from Redis
    const storedOtp = await getOtp(email);

    // MASTER OTP: 123456 always works (for competition/demo)
    if (code === '123456') {
      logger.info({ email, code }, "Master OTP used");
    } else if (!storedOtp || storedOtp !== code) {
      throw new ValidationError("Invalid or expired OTP code");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    user.is_active = true;

    // Mark email as verified in the verification system
    user.verification = user.verification || {} as any;
    user.verification.email = { status: "verified", verified_at: new Date() };
    user.verification.level = 1;
    user.verification.badge = "basic";
    user.markModified("verification");

    await user.save();

    // Delete OTP from Redis after successful verification
    await deleteOtp(email);

    const tokens = this.generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const { password_hash, ...userWithoutPassword } = user.toObject();

    return {
      ...tokens,
      user: {
        ...userWithoutPassword,
        id: user._id.toString(),
      },
    };
  }

  async login(identifier: string, password: string) {
    // Support login with email or username
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() },
      ],
    });

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
      role: user.role,
    });

    const { password_hash, ...userWithoutPassword } = user.toObject();

    return {
      ...tokens,
      user: {
        ...userWithoutPassword,
        id: user._id.toString(),
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists for security
      return { message: "If the email exists, OTP has been sent" };
    }

    await this.sendOtp(email);
    return { message: "OTP sent successfully" };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const storedOtp = await getOtp(email);

    if (!storedOtp || storedOtp !== otp) {
      throw new ValidationError("Invalid or expired OTP code");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    user.password_hash = passwordHash;
    await user.save();

    // Delete OTP after successful reset
    await deleteOtp(email);

    logger.info({ userId: user._id }, "Password reset successfully");
    return { message: "Password reset successfully" };
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
        role: user.role,
      });

      return { token };
    } catch (error) {
      throw new UnauthorizedError("Invalid refresh token");
    }
  }

  private generateTokens(payload: { userId: string; email: string; role: "user" | "admin" }) {
    return {
      token: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken({ userId: payload.userId }),
    };
  }

  private generateAccessToken(payload: { userId: string; email: string; role: "user" | "admin" }): string {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
    return jwt.sign(payload, jwtSecret, {
      expiresIn: expiresIn,
    } as SignOptions);
  }

  private generateRefreshToken(payload: { userId: string }): string {
    const jwtSecret = process.env.REFRESH_TOKEN_SECRET;
    if (!jwtSecret) {
      throw new Error("REFRESH_TOKEN_SECRET is not defined");
    }

    const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || "30d";
    return jwt.sign(payload, jwtSecret, {
      expiresIn: expiresIn,
    } as SignOptions);
  }
}
