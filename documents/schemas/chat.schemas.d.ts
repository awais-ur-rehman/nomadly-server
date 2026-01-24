export declare const chatSchemas: {
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
};
//# sourceMappingURL=chat.schemas.d.ts.map