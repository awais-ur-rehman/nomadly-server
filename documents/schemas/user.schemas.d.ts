export declare const userSchemas: {
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
};
//# sourceMappingURL=user.schemas.d.ts.map