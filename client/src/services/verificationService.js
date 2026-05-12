import {
    API_BASE_URL,
} from "../utils/constants";

export const sendVerificationVote =
    async (
        reportId,
        voteType
    ) => {

        try {

            const response =
                await fetch(

                    `${API_BASE_URL}/verify-incident`,

                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({

                            reportId,
                            voteType,

                        }),

                    }

                );

            return await response.json();

        } catch (error) {

            console.error(error);

            return {
                error:
                    "Verification failed",
            };

        }

    };