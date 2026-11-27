import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";

import App from "./App";
import "./index.css";
import "./rescuenet.css";
import "./workflows.css";
import "./portals.css";
import "leaflet/dist/leaflet.css";
import { Toaster } from "react-hot-toast";
import { CivilianSessionProvider } from "./context/CivilianSessionContext";
import { consumeDestination } from "./utils/authNavigation";

import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";

// Fix Leaflet's default icon paths for Vite production build
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
});

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      onRedirectCallback={(appState) => {
        const destination = consumeDestination(appState);
        window.history.replaceState({}, document.title, destination);
        window.dispatchEvent(new PopStateEvent("popstate"));
      }}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      }}
    >
      <Toaster position="top-right" />
      <CivilianSessionProvider>
        <App />
      </CivilianSessionProvider>
    </Auth0Provider>
  </React.StrictMode>
);
