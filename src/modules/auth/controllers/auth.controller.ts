import { type Request, type Response } from "express";
import { AuthService } from "../services/auth.service";
import { ApiResponse } from "../../../utils/response";
import { asyncHandler } from "../../../middleware/error-handler";

export class AuthController {
  constructor(private authService: AuthService) { }

  register = asyncHandler(async (req: Request, res: Response) => {
    let { email, password, username, name, phone, age, gender, invite_code } = req.body;

    // Generate username if not provided (backward compatibility)
    if (!username) {
      const baseName = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
      const randomSuffix = Math.floor(Math.random() * 10000);
      username = `${baseName}${randomSuffix}`.substring(0, 30);
    }

    const result = await this.authService.register(
      email,
      password,
      username,
      name,
      phone,
      age,
      gender,
      invite_code
    );
    ApiResponse.success(res, result, "Registration successful. Please verify your email.", 201);
  });

  verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, code } = req.body;
    const result = await this.authService.verifyOtp(email, code);
    ApiResponse.success(res, result, "Email verified successfully");
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { identifier, email, username, password } = req.body;
    // Support legacy login with email or username field
    const loginIdentifier = identifier || email || username;

    const result = await this.authService.login(loginIdentifier, password);
    ApiResponse.success(res, result, "Login successful");
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await this.authService.refreshToken(refreshToken);
    ApiResponse.success(res, result, "Token refreshed successfully");
  });

  resendOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    await this.authService.sendOtp(email);
    ApiResponse.success(res, null, "OTP sent successfully");
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await this.authService.forgotPassword(email);
    ApiResponse.success(res, result, "OTP sent to email");
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;
    const result = await this.authService.resetPassword(email, otp, newPassword);
    ApiResponse.success(res, result, "Password reset successfully");
  });
}
