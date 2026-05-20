const {
    GoogleGenerativeAI,
} = require(
    "@google/generative-ai"
);

const genAI =
    new GoogleGenerativeAI(
        process.env.GEMINI_API_KEY
    );

const analyzeReport = async (
    req,
    res
) => {

    try {
        if (!process.env.GEMINI_API_KEY) {
            console.error("Error: GEMINI_API_KEY is not configured in the environment variables!");
            return res.status(500).json({
                error: "Gemini API key is not configured on the server. Please add GEMINI_API_KEY to your server environment variables (e.g. in your Render Dashboard or local .env file)."
            });
        }

        const { description } = req.body;
        const mediaUrls = Array.isArray(req.body.mediaUrls)
            ? req.body.mediaUrls
            : [];

        const modelCandidates = [
            process.env.GEMINI_MODEL,
            "gemini-1.5",
            "gemini-1.5-pro",
            "gemini-1.0",
        ].filter(Boolean);

        let result;
        let lastAIError;

        const promptParts = [
            `
            Analyze this emergency report and classify its severity (LOW, MEDIUM, HIGH, or CRITICAL).
            Also, auto-assign the best responding department (Police, Ambulance, or Fire Brigade).
            
            Report description:
            ${description}
            
            Return ONLY a valid JSON object strictly matching this structure (no markdown, no backticks):
            {"severity": "HIGH", "department": "Ambulance"}
            `
        ];

        // Fetch and process images if any
        if (mediaUrls.length > 0) {
            for (const url of mediaUrls) {
                try {
                    const imageResp = await fetch(url);
                    const arrayBuffer = await imageResp.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const base64Data = buffer.toString('base64');
                    
                    // Note: This assumes JPEG/PNG. Cloudinary usually handles this.
                    // If you need exact mime type, you'd extract it from headers.
                    promptParts.push({
                        inlineData: {
                            data: base64Data,
                            mimeType: "image/jpeg"
                        }
                    });
                } catch (imgError) {
                    console.error("Failed to fetch image for AI:", imgError);
                }
            }
        }

        for (const candidate of modelCandidates) {
            try {
                const model = genAI.getGenerativeModel({ model: candidate });
                result = await model.generateContent(promptParts);
                console.log(`AI model used: ${candidate}`);
                break;
            } catch (err) {
                lastAIError = err;
                if (err.status === 404 || err.message?.includes('not found')) {
                    console.warn(`Gemini model not available for generateContent: ${candidate}. Trying next candidate.`);
                    continue;
                }
                throw err;
            }
        }

        if (!result) {
            throw lastAIError || new Error('Failed to generate AI content with any configured Gemini model.');
        }

        const responseText =
            result.response
                .text()
                .trim()
                .replace(/```json/g, '')
                .replace(/```/g, '');

        let parsedData = {};
        try {
            parsedData = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse AI JSON:", responseText);
            parsedData = { severity: "LOW", department: "Police" };
        }

        res.json({

            severity: parsedData.severity || "LOW",
            department: parsedData.department || "Police"

        });

    } catch (error) {

        console.error("AI Analysis Error:", error);
        console.error("Error Details:", {
            message: error.message,
            code: error.code,
            status: error.status,
            stack: error.stack
        });

        // Check if it's a GEMINI API key issue
        if (error.message && error.message.includes('API key')) {
            return res.status(500).json({
                error: "GEMINI_API_KEY not configured. Check server environment variables.",
                details: error.message
            });
        }

        res.status(500).json({

            error: "AI analysis failed",
            message: error.message

        });

    }

};

module.exports = {
    analyzeReport,
};