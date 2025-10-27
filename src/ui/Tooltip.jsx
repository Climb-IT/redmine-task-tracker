import { useContext, onMount, onCleanup } from "solid-js";
import { TooltipContext } from "@/tooltip";

let timeoutId;

export default function Tooltip({ children, trigger, delay = 100 }) {
  const context = useContext(TooltipContext);

  const getTooltipEl = () => context.tooltipEl;

  function onMouseEnter() {
    const tooltipEl = getTooltipEl();
    context.setTooltipContent(children);
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      tooltipEl.style.opacity = "1";
      tooltipEl.style.pointerEvents = "auto";
      tooltipEl.style.zIndex = "100";
    }, delay);
  }

  function onMouseLeave() {
    const tooltipEl = getTooltipEl();
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      tooltipEl.style.opacity = "0";
      tooltipEl.style.pointerEvents = "none";
      tooltipEl.style.zIndex = "-1";
      tooltipEl.style.left = "0";
      tooltipEl.style.top = "0";
    }, delay);
  }

  function onMouseMove(e) {
    const tooltipEl = getTooltipEl();
    const element = typeof trigger === "function" ? trigger() : trigger;
    const rect = tooltipEl.getBoundingClientRect();
    const triggerRect = element.getBoundingClientRect();
    const scrollLeft = window.scrollX;
    const scrollTop = window.scrollY;
    let x = e.clientX - rect.width / 2;
    let y = triggerRect.top - rect.height - 10;
    if (x < scrollLeft + 10) {
      x = scrollLeft + 10;
    }
    if (x + rect.width >= window.innerWidth - 10) {
      x = window.innerWidth - rect.width - 10;
    }
    if (y < scrollTop) {
      y = triggerRect.top + triggerRect.height + 10;
    }
    tooltipEl.style.left = `${x}px`;
    tooltipEl.style.top = `${y}px`;
  }

  onMount(() => {
    const element = typeof trigger === "function" ? trigger() : trigger;
    element.addEventListener("mouseenter", onMouseEnter);
    element.addEventListener("mouseleave", onMouseLeave);
    element.addEventListener("mousemove", onMouseMove);
  });

  onCleanup(() => {
    const element = typeof trigger === "function" ? trigger() : trigger;
    element.removeEventListener("mouseenter", onMouseEnter);
    element.removeEventListener("mouseleave", onMouseLeave);
    element.removeEventListener("mousemove", onMouseMove);
  });

  return trigger;
}
