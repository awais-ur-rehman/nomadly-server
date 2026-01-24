export declare const commonSchemas: {
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
//# sourceMappingURL=common.schemas.d.ts.map