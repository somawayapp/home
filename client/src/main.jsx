import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Auth0Provider
     domain="dev-o5a05odll5uw2ohu.au.auth0.com"
     clientId="vtGPFtLS2dKG6aUMv0lvgaFMqJskypbC"
     authorizationParams={{
      redirect_uri: "https://homeclient.vercel.app"
     }}
     audience="http://localhost:8000"
     scope="openid profile email"
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);
