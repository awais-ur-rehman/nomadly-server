export declare const vouchingSchemas: {
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
};
//# sourceMappingURL=vouching.schemas.d.ts.map