import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
    import.meta.env.VITE_GEMINI_API_KEY
);

export const classifyEmergency = async (description) => {

    try {

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash-latest",
        });

        const prompt = `
    Classify this emergency into one category only:
    LOW
    MEDIUM
    HIGH
    CRITICAL

    Emergency:
    ${description}

    Return ONLY the category name.
    `;

        const result = await model.generateContent(prompt);

        const response = await result.response;

        return response.text().trim();

    } catch (error) {

        console.error(error);

        return "UNKNOWN";
    }
};