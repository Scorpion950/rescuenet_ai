import {
    analyzeEmergency,
} from "../services/aiService";

export const classifyEmergency =
    async (description, mediaUrls = []) => {

        return await analyzeEmergency(
            description,
            mediaUrls
        );

    };