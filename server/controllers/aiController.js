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

        const { description } =
            req.body;

        const model =
            genAI.getGenerativeModel({

                model:
                    "gemini-2.5-flash-lite",

            });

        const prompt = `

      Analyze this emergency report
      and classify severity:

      LOW, MEDIUM, HIGH,
      or CRITICAL.

      Report:
      ${description}

      Return ONLY one word.

    `;

        const result =
            await model.generateContent(
                prompt
            );

        const response =
            result.response
                .text()
                .trim();

        res.json({

            severity: response,

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