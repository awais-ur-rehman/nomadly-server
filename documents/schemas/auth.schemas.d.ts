export declare const authSchemas: {
    RegisterRequest: {
        type: string;
        required: string[];
        properties: {
            email: {
                type: string;
                format: string;
                example: string;
            };
            password: {
                type: string;
                minLength: number;
                example: string;
            };
            name: {
                type: string;
                minLength: number;
                example: string;
            };
            phone: {
                type: string;
                example: string;
                description: string;
            };
            age: {
                type: string;
                example: number;
                description: string;
            };
            gender: {
                type: string;
                example: string;
                description: string;
            };
        };
    };
    VerifyOtpRequest: {
        type: string;
        required: string[];
        properties: {
            email: {
                type: string;
                format: string;
                example: string;
            };
            code: {
                type: string;
                length: number;
                example: string;
            };
        };
    };
    LoginRequest: {
        type: string;
        required: string[];
        properties: {
            email: {
                type: string;
                format: string;
                example: string;
            };
            password: {
                type: string;
                example: string;
            };
        };
    };
    RefreshTokenRequest: {
        type: string;
        required: string[];
        properties: {
            refreshToken: {
                type: string;
                example: string;
            };
        };
    };
    ResendOtpRequest: {
        type: string;
        required: string[];
        properties: {
            email: {
                type: string;
                format: string;
                example: string;
            };
        };
    };
    AuthResponse: {
        type: string;
        properties: {
            status: {
                type: string;
                example: string;
            };
            message: {
                type: string;
                example: string;
            };
            data: {
                type: string;
                properties: {
                    token: {
                        type: string;
                        example: string;
                    };
                    refreshToken: {
                        type: string;
                        example: string;
                    };
                    user: {
                        type: string;
                        properties: {
                            id: {
                                type: string;
                                example: string;
                            };
                            email: {
                                type: string;
                                example: string;
                            };
                            isActive: {
                                type: string;
                                example: boolean;
                            };
                        };
                    };
                };
            };
        };
    };
};
//# sourceMappingURL=auth.schemas.d.ts.map