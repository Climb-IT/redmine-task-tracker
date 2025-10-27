import { createContext, createSignal } from "solid-js";

export const TooltipContext = createContext();

export function TooltipProvider(props) {
  const [tooltipContent, setTooltipContent] = createSignal();
  let tooltipEl;
  return (
    <TooltipContext.Provider
      value={{
        get tooltipEl() {
          return tooltipEl;
        },
        setTooltipContent,
      }}
    >
      {props.children}
      <div
        ref={tooltipEl}
        class="tooltip fixed z-[-1] whitespace-normal break-words opacity-0 pointer-events-none"
      >
        {tooltipContent()}
      </div>
    </TooltipContext.Provider>
  );
}
