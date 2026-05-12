import {
    analyzeEmergency,
} from "../services/aiService";

export const classifyEmergency =
    async (description) => {

        return await analyzeEmergency(
            description
        );

    };