export declare const schemas: {
    UploadImageResponse: {
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
                    url: {
                        type: string;
                        example: string;
                        description: string;
                    };
                    public_id: {
                        type: string;
                        example: string;
                        description: string;
                    };
                    format: {
                        type: string;
                        example: string;
                        description: string;
                    };
                    folder: {
                        type: string;
                        example: string;
                        description: string;
                    };
                };
            };
        };
    };
    DeleteImageResponse: {
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
            };
        };
    };
    SubscriptionStatus: {
        type: string;
        properties: {
            status: {
                type: string;
                enum: string[];
                example: string;
            };
            plan: {
                type: string;
                enum: string[];
                example: string;
            };
            expires_at: {
                type: string;
                format: string;
            };
            revenue_cat_id: {
                type: string;
            };
        };
    };
    PaymentStatusResponse: {
        type: string;
        properties: {
            status: {
                type: string;
                example: string;
            };
            data: {
                $ref: string;
            };
        };
    };
    RevenueCatWebhook: {
        type: string;
        properties: {
            event_type: {
                type: string;
                enum: string[];
            };
            app_user_id: {
                type: string;
            };
            product_id: {
                type: string;
            };
        };
    };
    Vouch: {
        type: string;
        properties: {
            _id: {
                type: string;
                example: string;
            };
            voucher_id: {
                type: string;
                properties: {
                    _id: {
                        type: string;
                    };
                    profile: {
                        $ref: string;
                    };
                };
            };
            vouchee_id: {
                type: string;
            };
            created_at: {
                type: string;
                format: string;
            };
        };
    };
    VouchesResponse: {
        type: string;
        properties: {
            status: {
                type: string;
                example: string;
            };
            data: {
                type: string;
                items: {
                    $ref: string;
                };
            };
        };
    };
    SendMessageRequest: {
        type: string;
        required: string[];
        properties: {
            message: {
                type: string;
                example: string;
            };
            message_type: {
                type: string;
                enum: string[];
                example: string;
            };
        };
    };
    Message: {
        type: string;
        properties: {
            _id: {
                type: string;
                example: string;
            };
            conversation_id: {
                type: string;
            };
            sender_id: {
                type: string;
                properties: {
                    _id: {
                        type: string;
                    };
                    profile: {
                        $ref: string;
                    };
                };
            };
            message: {
                type: string;
                example: string;
            };
            message_type: {
                type: string;
                enum: string[];
                example: string;
            };
            read_by: {
                type: string;
                items: {
                    type: string;
                };
            };
            timestamp: {
                type: string;
                format: string;
            };
        };
    };
    Conversation: {
        type: string;
        properties: {
            _id: {
                type: string;
                example: string;
            };
            participants: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        _id: {
                            type: string;
                        };
                        profile: {
                            $ref: string;
                        };
                    };
                };
            };
            type: {
                type: string;
                enum: string[];
                example: string;
            };
            last_message: {
                type: string;
                example: string;
            };
            last_message_time: {
                type: string;
                format: string;
            };
            created_at: {
                type: string;
                format: string;
            };
        };
    };
    MessagesResponse: {
        type: string;
        properties: {
            status: {
                type: string;
                example: string;
            };
            data: {
                type: string;
                items: {
                    $ref: string;
                };
            };
            pagination: {
                $ref: string;
            };
        };
    };
    ConversationsResponse: {
        type: string;
        properties: {
            status: {
                type: string;
                example: string;
            };
            data: {
                type: string;
                items: {
                    $ref: string;
                };
            };
        };
    };
    ConsultationRequest: {
        type: string;
        required: string[];
        properties: {
            builder_id: {
                type: string;
                example: string;
            };
            specialty: {
                type: string;
                example: string;
            };
        };
    };
    Consultation: {
        type: string;
        properties: {
            _id: {
                type: string;
                example: string;
            };
            requester_id: {
                type: string;
            };
            builder_id: {
                type: string;
            };
            specialty: {
                type: string;
                example: string;
            };
            status: {
                type: string;
                enum: string[];
                example: string;
            };
            scheduled_time: {
                type: string;
                format: string;
            };
            payment_status: {
                type: string;
                enum: string[];
                example: string;
            };
            payment_id: {
                type: string;
            };
            created_at: {
                type: string;
                format: string;
            };
        };
    };
    ReviewRequest: {
        type: string;
        required: string[];
        properties: {
            consultation_id: {
                type: string;
                example: string;
            };
            rating: {
                type: string;
                minimum: number;
                maximum: number;
                example: number;
            };
            comment: {
                type: string;
                example: string;
            };
        };
    };
    Review: {
        type: string;
        properties: {
            _id: {
                type: string;
                example: string;
            };
            consultation_id: {
                type: string;
            };
            reviewer_id: {
                type: string;
            };
            builder_id: {
                type: string;
            };
            rating: {
                type: string;
                example: number;
            };
            comment: {
                type: string;
            };
            created_at: {
                type: string;
                format: string;
            };
        };
    };
    BuilderSearchResponse: {
        type: string;
        properties: {
            status: {
                type: string;
                example: string;
            };
            data: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        _id: {
                            type: string;
                        };
                        profile: {
                            $ref: string;
                        };
                        builder_profile: {
                            $ref: string;
                        };
                    };
                };
            };
            pagination: {
                $ref: string;
            };
        };
    };
    CreateActivityRequest: {
        type: string;
        required: string[];
        properties: {
            activity_type: {
                type: string;
                example: string;
                description: string;
            };
            location: {
                type: string;
                required: string[];
                properties: {
                    lat: {
                        type: string;
                        example: number;
                    };
                    lng: {
                        type: string;
                        example: number;
                    };
                };
            };
            max_participants: {
                type: string;
                example: number;
                minimum: number;
            };
            event_time: {
                type: string;
                format: string;
                example: string;
            };
            description: {
                type: string;
                example: string;
            };
            verified_only: {
                type: string;
                example: boolean;
                description: string;
            };
        };
    };
    Activity: {
        type: string;
        properties: {
            _id: {
                type: string;
                example: string;
            };
            host_id: {
                type: string;
                properties: {
                    _id: {
                        type: string;
                    };
                    profile: {
                        $ref: string;
                    };
                    nomad_id: {
                        type: string;
                        properties: {
                            verified: {
                                type: string;
                            };
                        };
                    };
                };
            };
            activity_type: {
                type: string;
                example: string;
            };
            location: {
                $ref: string;
            };
            max_participants: {
                type: string;
                example: number;
            };
            current_participants: {
                type: string;
                items: {
                    type: string;
                };
            };
            pending_requests: {
                type: string;
                items: {
                    type: string;
                };
            };
            event_time: {
                type: string;
                format: string;
            };
            description: {
                type: string;
            };
            verified_only: {
                type: string;
            };
            status: {
                type: string;
                enum: string[];
                example: string;
            };
            created_at: {
                type: string;
                format: string;
            };
        };
    };
    ActivityResponse: {
        type: string;
        properties: {
            status: {
                type: string;
                example: string;
            };
            data: {
                type: string;
                items: {
                    $ref: string;
                };
            };
        };
    };
    SwipeRequest: {
        type: string;
        required: string[];
        properties: {
            matched_user_id: {
                type: string;
                example: string;
            };
            action: {
                type: string;
                enum: string[];
                example: string;
            };
        };
    };
    MatchResult: {
        type: string;
        properties: {
            user: {
                type: string;
                properties: {
                    id: {
                        type: string;
                        example: string;
                    };
                    profile: {
                        $ref: string;
                    };
                    rig: {
                        $ref: string;
                    };
                    nomad_id: {
                        type: string;
                        properties: {
                            verified: {
                                type: string;
                            };
                            vouch_count: {
                                type: string;
                            };
                        };
                    };
                };
            };
            intersection: {
                $ref: string;
            };
            distance: {
                type: string;
                example: number;
                description: string;
            };
            score: {
                type: string;
                example: number;
            };
            commonHobbies: {
                type: string;
                items: {
                    type: string;
                };
                example: string[];
            };
        };
    };
    DiscoveryResponse: {
        type: string;
        properties: {
            status: {
                type: string;
                example: string;
            };
            data: {
                type: string;
                items: {
                    $ref: string;
                };
            };
        };
    };
    MutualMatch: {
        type: string;
        properties: {
            matchId: {
                type: string;
                example: string;
            };
            user: {
                type: string;
                properties: {
                    _id: {
                        type: string;
                    };
                    profile: {
                        $ref: string;
                    };
                    rig: {
                        $ref: string;
                    };
                };
            };
            createdAt: {
                type: string;
                format: string;
            };
        };
    };
    UserProfile: {
        type: string;
        properties: {
            name: {
                type: string;
                example: string;
            };
            age: {
                type: string;
                example: number;
            };
            gender: {
                type: string;
                example: string;
            };
            photo_url: {
                type: string;
                example: string;
            };
            hobbies: {
                type: string;
                items: {
                    type: string;
                };
                example: string[];
            };
            intent: {
                type: string;
                enum: string[];
                example: string;
            };
            bio: {
                type: string;
                example: string;
            };
        };
    };
    RigInfo: {
        type: string;
        properties: {
            type: {
                type: string;
                enum: string[];
                example: string;
            };
            crew_type: {
                type: string;
                enum: string[];
                example: string;
            };
            pet_friendly: {
                type: string;
                example: boolean;
            };
        };
    };
    BuilderProfile: {
        type: string;
        properties: {
            specialty_tags: {
                type: string;
                items: {
                    type: string;
                };
                example: string[];
            };
            hourly_rate: {
                type: string;
                example: number;
            };
            availability_status: {
                type: string;
                enum: string[];
                example: string;
            };
            bio: {
                type: string;
                example: string;
            };
        };
    };
    TravelRoute: {
        type: string;
        properties: {
            origin: {
                type: string;
                properties: {
                    lat: {
                        type: string;
                        example: number;
                    };
                    lng: {
                        type: string;
                        example: number;
                    };
                };
            };
            destination: {
                type: string;
                properties: {
                    lat: {
                        type: string;
                        example: number;
                    };
                    lng: {
                        type: string;
                        example: number;
                    };
                };
            };
            start_date: {
                type: string;
                format: string;
                example: string;
            };
            duration_days: {
                type: string;
                example: number;
            };
        };
    };
    UpdateProfileRequest: {
        type: string;
        properties: {
            profile: {
                $ref: string;
            };
            rig: {
                $ref: string;
            };
            is_builder: {
                type: string;
                example: boolean;
            };
            builder_profile: {
                $ref: string;
            };
        };
    };
    CompleteProfileRequest: {
        type: string;
        description: string;
        properties: {
            profile: {
                type: string;
                description: string;
                properties: {
                    hobbies: {
                        type: string;
                        items: {
                            type: string;
                        };
                        example: string[];
                        description: string;
                    };
                    intent: {
                        type: string;
                        enum: string[];
                        example: string;
                        description: string;
                    };
                    bio: {
                        type: string;
                        example: string;
                        description: string;
                    };
                    photo_url: {
                        type: string;
                        example: string;
                        description: string;
                    };
                };
            };
            rig: {
                type: string;
                description: string;
                properties: {
                    type: {
                        type: string;
                        enum: string[];
                        example: string;
                    };
                    crew_type: {
                        type: string;
                        enum: string[];
                        example: string;
                    };
                    pet_friendly: {
                        type: string;
                        example: boolean;
                    };
                };
            };
        };
    };
    UpdateRouteRequest: {
        type: string;
        required: string[];
        properties: {
            origin: {
                type: string;
                required: string[];
                properties: {
                    lat: {
                        type: string;
                        example: number;
                    };
                    lng: {
                        type: string;
                        example: number;
                    };
                };
            };
            destination: {
                type: string;
                required: string[];
                properties: {
                    lat: {
                        type: string;
                        example: number;
                    };
                    lng: {
                        type: string;
                        example: number;
                    };
                };
            };
            start_date: {
                type: string;
                format: string;
                example: string;
            };
            duration_days: {
                type: string;
                example: number;
            };
        };
    };
    UserResponse: {
        type: string;
        properties: {
            status: {
                type: string;
                example: string;
            };
            data: {
                type: string;
                properties: {
                    _id: {
                        type: string;
                        example: string;
                    };
                    email: {
                        type: string;
                        example: string;
                    };
                    profile: {
                        $ref: string;
                    };
                    rig: {
                        $ref: string;
                    };
                    travel_route: {
                        $ref: string;
                    };
                    is_builder: {
                        type: string;
                        example: boolean;
                    };
                    builder_profile: {
                        $ref: string;
                    };
                    nomad_id: {
                        type: string;
                        properties: {
                            verified: {
                                type: string;
                                example: boolean;
                            };
                            member_since: {
                                type: string;
                                format: string;
                            };
                            vouch_count: {
                                type: string;
                                example: number;
                            };
                        };
                    };
                };
            };
        };
    };
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
    Error: {
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
            errors: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        field: {
                            type: string;
                        };
                        message: {
                            type: string;
                        };
                    };
                };
            };
        };
    };
    Success: {
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
            };
        };
    };
    Pagination: {
        type: string;
        properties: {
            page: {
                type: string;
                example: number;
            };
            limit: {
                type: string;
                example: number;
            };
            total: {
                type: string;
                example: number;
            };
            pages: {
                type: string;
                example: number;
            };
        };
    };
    GeospatialPoint: {
        type: string;
        properties: {
            type: {
                type: string;
                example: string;
            };
            coordinates: {
                type: string;
                items: {
                    type: string;
                };
                example: number[];
                minItems: number;
                maxItems: number;
            };
        };
    };
};
//# sourceMappingURL=index.d.ts.map