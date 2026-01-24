export declare const matchingSchemas: {
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
};
//# sourceMappingURL=matching.schemas.d.ts.map