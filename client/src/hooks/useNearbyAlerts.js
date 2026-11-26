import { useEffect, useState } from "react";
import { useLocation } from "../context/LocationContext";
import { publicApi } from "../services/api";

export default function useNearbyAlerts() {
  const { userLocation } = useLocation();
  const [nearbyAlerts, setNearbyAlerts] = useState([]);
  useEffect(() => {
    if (!userLocation) {
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const response = await publicApi("/nearby-incidents", {
          latitude: userLocation[0], longitude: userLocation[1],
        });
        if (!cancelled) setNearbyAlerts(response.incidents || []);
      } catch {
        if (!cancelled) setNearbyAlerts([]);
      }
    };
    load();
    const timer = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [userLocation]);
  return userLocation ? nearbyAlerts : [];
}
