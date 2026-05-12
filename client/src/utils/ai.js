export const classifyEmergency = async (
    description
) => {

    try {

        const response = await fetch(
            "http://localhost:5000/analyze-report",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    description,
                }),

            }
        );

        const data = await response.json();

        return data.severity;

    } catch (error) {

        console.error(error);

        return "PENDING";

    }

};