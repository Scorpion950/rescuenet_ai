import React from "react";

import ReactDOM from "react-dom/client";

import App from "./App";

import "./index.css";

import "leaflet/dist/leaflet.css";

import {
  Toaster,
} from "react-hot-toast";

import { Auth0Provider } from '@auth0/auth0-react';

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

ReactDOM.createRoot(

  document.getElementById("root")

).render(

  <React.StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN || ""}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID || ""}
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
    >
      <Toaster
        position="top-right"
      />
      <App />
    </Auth0Provider>
  </React.StrictMode>

);