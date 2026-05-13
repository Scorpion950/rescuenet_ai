import {

    API_BASE_URL,

} from "../utils/constants";

/* Common Headers */
const responderHeaders = {

    "x-responder-key":

        localStorage.getItem(
            "responderType"
        ),

};

/* Fetch incidents */
export const getResponderIncidents =

    async (type) => {

        const response =

            await fetch(

                `${API_BASE_URL}/responder-incidents/${type}`,

                {

                    headers:
                        responderHeaders,

                }

            );

        return await response.json();

    };

/* Deploy */
export const deployIncident =

    async (id) => {

        await fetch(

            `${API_BASE_URL}/deploy-incident/${id}`,

            {

                method: "PUT",

                headers:
                    responderHeaders,

            }

        );

    };

/* Resolve */
export const resolveIncident =

    async (id) => {

        await fetch(

            `${API_BASE_URL}/resolve-incident/${id}`,

            {

                method: "PUT",

                headers:
                    responderHeaders,

            }

        );

    };