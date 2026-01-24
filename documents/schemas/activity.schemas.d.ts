export declare const activitySchemas: {
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
};
//# sourceMappingURL=activity.schemas.d.ts.map