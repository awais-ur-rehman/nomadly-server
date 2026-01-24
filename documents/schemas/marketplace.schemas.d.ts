export declare const marketplaceSchemas: {
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
};
//# sourceMappingURL=marketplace.schemas.d.ts.map