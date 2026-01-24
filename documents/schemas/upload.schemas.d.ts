export declare const uploadSchemas: {
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
};
//# sourceMappingURL=upload.schemas.d.ts.map