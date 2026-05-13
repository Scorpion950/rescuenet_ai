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

        const { description, mediaUrls = [] } =
            req.body;

        const model =
            genAI.getGenerativeModel({

                model:
                    "gemini-2.5-flash",

            });

        let promptParts = [
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

        const result =
            await model.generateContent(
                promptParts
            );

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
            parsedData = { severity: "PENDING", department: "Police" };
        }

        res.json({

            severity: parsedData.severity || "PENDING",
            department: parsedData.department || "Police"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            error:
                "AI analysis failed",

        });

    }

};

module.exports = {
    analyzeReport,
};