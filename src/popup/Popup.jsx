import { Show, createSignal, createMemo, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import Issues from "../issues/Issues";
import Time from "../time/Time";
import Settings from "../settings/Settings";
import Button from "../components/Button";
import fetchIssues from "../issues/api";
import fetchTimeEntries from "../time/api";

const HOURS_PER_DAY = 8;

const tabs = [
  { name: "Issues", component: Issues },
  { name: "Time", component: Time },
  { name: "Settings", component: Settings },
];

function makeUTCDate(year, month, day) {
  return new Date(Date.UTC(year, month, day));
}

function splitMonthIntoWorkWeeks(year, month, currentDay) {
  let days = currentDay;
  const weeks = [];
  let currentWeek = [];

  for (let day = 1; day <= days; day++) {
    const date = makeUTCDate(year, month, day);
    const dayOfWeek = date.getDay(); // Sunday = 0, Saturday = 6

    // skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    if (day === days && dayOfWeek < 5) {
      days++;
    }

    currentWeek.push(date.toISOString().split("T")[0]);

    // Friday (5) ends a workweek
    if (dayOfWeek === 5 || day === days) {
      weeks.push(currentWeek.reverse());
      currentWeek = [];
    }
  }

  return weeks.reverse();
}

function Popup() {
  const [store, setStore] = createStore({
    sites: [],
    issues: [],
    timeEntries: {},
    lastRefresh: 0,
    weeks: [],
    from: "",
    to: "",
    loading: false,
  });
  const [tab, setTab] = createSignal("Issues");
  const activeTab = createMemo(() => tabs.find((t) => t.name === tab()));

  async function refresh() {
    setStore("loading", true);
    try {
      const [issues, timeEntries] = await Promise.all([
        fetchIssues(store.sites),
        fetchTimeEntries(store.sites, store.from, store.to),
      ]);
      const lastRefresh = Date.now();
      // Update store reactively
      chrome.storage?.local.set({ lastRefresh });
      setStore({
        loading: false,
        issues: Array.isArray(issues) ? issues : [],
        timeEntries: timeEntries || {},
        lastRefresh,
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      setStore("loading", false);
    }
  }

  onMount(() => {
    chrome.storage?.local.get("redmineSites", (result) => {
      const sites = result.redmineSites;
      setStore("sites", Array.isArray(sites) ? sites : []);
    });
    chrome.storage?.local.get("issues", (result) => {
      const issues = result.issues;
      setStore("issues", Array.isArray(issues) ? issues : []);
    });
    // Set default from/to to current month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    const daysInMonth = makeUTCDate(year, month + 1, 0).getDate();
    const from = `${year}-${month + 1}-01`;
    const to = `${year}-${month + 1}-${daysInMonth}`;
    setStore({
      from,
      to,
      weeks: splitMonthIntoWorkWeeks(year, month, day),
    });
    chrome.storage?.local.get("timeEntries", (result) => {
      setStore("timeEntries", result.timeEntries || {});
    });
    chrome.storage?.local.get("lastRefresh", (result) => {
      setStore("lastRefresh", result.lastRefresh || 0);
    });
  });

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
        <Show when={store.lastRefresh}>
          <p>{new Date(store.lastRefresh).toLocaleString()}</p>
        </Show>
        <Button onClick={refresh}>
          <Show when={store.loading}>Loading...</Show>
          <Show when={!store.loading}>Refresh</Show>
        </Button>
      </div>
      <div class="tab-content">{activeTab()?.component({ store }) || null}</div>
    </div>
  );
}

export default Popup;
