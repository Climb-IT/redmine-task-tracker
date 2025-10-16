import { createSignal, createMemo } from "solid-js";
import Issues from "./Issues";
import Time from "./Time";
import Settings from "../settings/Settings";

const tabs = [
  { name: "Issues", component: Issues },
  { name: "Time", component: Time },
  { name: "Settings", component: Settings },
];

function Popup() {
  const [tab, setTab] = createSignal("Issues");
  const activeTab = createMemo(() => tabs.find((t) => t.name === tab()));

  return (
    <div id="popup">
      <div class="tabs-menu">
        {tabs.map((t) => (
          <button
            onClick={() => setTab(t.name)}
            classList={{ "tab-btn": true, active: t.name === tab() }}
          >
            {t.name}
          </button>
        ))}
      </div>
      <div class="tab-content">{activeTab()?.component() || null}</div>
    </div>
  );
}

export default Popup;
