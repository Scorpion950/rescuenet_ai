const stations =
    require("../data/stations");

const calculateDistance =
    require("./distanceCalculator");

function findNearestStations(

    services,
    latitude,
    longitude

) {

    const nearestStations = [];

    services.forEach((service) => {

        // Filter stations by type
        const matchingStations =

            stations.filter(

                (station) =>

                    station.type === service

            );

        // Find nearest station
        let nearest = null;

        let minDistance = Infinity;

        matchingStations.forEach((station) => {

            const distance =
                calculateDistance(

                    latitude,
                    longitude,

                    station.latitude,
                    station.longitude

                );

            if (distance < minDistance) {

                minDistance = distance;

                nearest = {

                    ...station,

                    distance:
                        distance.toFixed(2),

                };

            }

        });

        // Push nearest station
        if (nearest) {

            nearestStations.push(nearest);

        }

    });

    return nearestStations;

}

module.exports =
    findNearestStations;