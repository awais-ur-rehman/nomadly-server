import { type Request, type Response } from "express";
import { AuthService } from "../services/auth.service";
import { ApiResponse } from "../../../utils/response";
import { asyncHandler } from "../../../middleware/error-handler";

export class AuthController {
  constructor(private authService: AuthService) {}

  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name, phone, age, gender } = req.body;
    const result = await this.authService.register(
      email,
      password,
      name,
      phone,
      age,
      gender
    );
    ApiResponse.success(res, result, "Registration successful. Please verify your email.", 201);
  });

  verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, code } = req.body;
    const result = await this.authService.verifyOtp(email, code);
    ApiResponse.success(res, result, "Email verified successfully");
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await this.authService.login(email, password);
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
}
