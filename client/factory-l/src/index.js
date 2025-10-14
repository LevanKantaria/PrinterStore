import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import { FronteggProvider } from '@frontegg/react';


const contextOptions = {
  baseUrl: 'https://app-904mzrhn44ln.frontegg.com',
  clientId: '301f8626-f317-4196-b938-60370590432b',
  appId: '[YOUR_APP_ID]' 
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
      <FronteggProvider 
    contextOptions={contextOptions} 
    hostedLoginBox={false}
    >
        <App />
    </FronteggProvider>      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
