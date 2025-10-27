/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App";
import { StoreProvider } from "./store";
import { TooltipProvider } from "./tooltip";

const root = document.getElementById("root");

render(
  () => (
    <StoreProvider>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </StoreProvider>
  ),
  root
);
