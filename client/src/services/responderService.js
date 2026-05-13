import {
    API_BASE_URL,
} from "../utils/constants";

/* Fetch incidents */
export const getResponderIncidents =
    async (type) => {

        const response =
            await fetch(

                `${API_BASE_URL}/responder-incidents/${type}`

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
            }

        );

    };