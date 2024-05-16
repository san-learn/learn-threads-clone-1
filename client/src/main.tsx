import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";

import type { Styles, GlobalStyleProps } from "@chakra-ui/theme-tools";
import { mode } from "@chakra-ui/theme-tools";
import { ChakraProvider, ColorModeScript, extendTheme } from "@chakra-ui/react";

import { SocketContextProvider } from "./context/socket-context.jsx";

import "./index.css";

import App from "./App.tsx";

const styles: Styles = {
  global: (props: GlobalStyleProps) => ({
    body: {
      color: mode("gray.800", "whiteAlpha.900")(props),
      bg: mode("gray.100", "#101010")(props),
    },
  }),
};

const config = {
  initialColorMode: "dark",
  useSystemColorMode: true,
};

const colors = {
  gray: {
    light: "#616161",
    dark: "#1e1e1e",
  },
};

const theme = extendTheme({ colors, config, styles });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RecoilRoot>
      <BrowserRouter>
        <ChakraProvider theme={theme}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <SocketContextProvider>
            <App />
          </SocketContextProvider>
        </ChakraProvider>
      </BrowserRouter>
    </RecoilRoot>
  </React.StrictMode>
);
