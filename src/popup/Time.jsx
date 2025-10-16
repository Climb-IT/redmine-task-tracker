import { createMemo, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { For } from "solid-js/web";
import Section from "../components/Section";
import Button from "../components/Button";

const HOURS_PER_DAY = 8;

function makeUTCDate(year, month, day) {
  return new Date(Date.UTC(year, month, day));
}

function toLocaleDateString(date, ...options) {
  return new Date(date).toLocaleDateString(...options);
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

function TimeBar(props) {
  const widths = createMemo(() =>
    (props.timeEntries[props.day] || []).map((entry) => [
      (entry.hours / HOURS_PER_DAY) * 100,
      entry.url,
    ])
  );
  const totalWidth = createMemo(() =>
    widths().reduce((sum, [w]) => sum + w, 0)
  );

  return (
    <div class="time-bar">
      <For each={widths()}>
        {([w, url]) => (
          <a
            href={url}
            class="time-bar-fill"
            style={{ width: `${w}%` }}
            target="_blank"
          />
        )}
      </For>
      {totalWidth() < 100 && (
        <div
          class="time-bar-fill-rest"
          style={{ width: `${100 - totalWidth()}%` }}
        />
      )}
    </div>
  );
}

function Time() {
  const [state, setState] = createStore({
    sites: [],
    timeEntries: {},
    loading: false,
    weeks: [],
    from: "",
    to: "",
  });

  // ✅ Compute total hours per day and per week reactively
  const totals = createMemo(() => {
    let overall = 0;
    const perDay = {};
    const perWeek = {};

    // Precompute totals for each day
    for (const [date, entries] of Object.entries(state.timeEntries || {})) {
      perDay[date] = entries.reduce((sum, e) => sum + e.hours, 0);
      overall += perDay[date];
    }

    // Precompute totals for each week
    for (const week of state.weeks) {
      const weekKey = `${week[week.length - 1]}_${week[0]}`;
      perWeek[weekKey] = week.reduce((sum, day) => sum + (perDay[day] || 0), 0);
    }

    return { perDay, perWeek, overall };
  });

  const sectionTitle = createMemo(() => `Spent time ${totals().overall}h`);

  onMount(() => {
    // Set default from/to to current month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    const daysInMonth = makeUTCDate(year, month + 1, 0).getDate();
    const from = `${year}-${month + 1}-01`;
    const to = `${year}-${month + 1}-${daysInMonth}`;
    setState({
      from,
      to,
      weeks: splitMonthIntoWorkWeeks(year, month, day),
    });
    // Load sites and time entries
    chrome.storage?.local.get("redmineSites", (result) => {
      const sites = result.redmineSites;
      setState("sites", Array.isArray(sites) ? sites : []);
    });
    chrome.storage?.local.get("timeEntries", (result) => {
      setState("timeEntries", result.timeEntries || {});
    });
  });

  function loadTimeEntries() {
    setState("loading", true);
    const allTimeSeries = [];
    const promises = [];
    state.sites.forEach((site) => {
      promises.push(
        fetch(
          `${site.url}/time_entries.json?user_id=me&sort=updated_on:desc&from=${state.from}&to=${state.to}&limit=1000`,
          {
            headers: {
              "X-Redmine-API-Key": site.apiKey,
            },
          }
        )
          .then((response) => response.json())
          .then((data) => {
            allTimeSeries.push(
              data.time_entries.map((e) => ({
                id: e.id,
                issue_id: e.issue.id,
                url: `${site.url}/issues/${e.issue.id}`,
                hours: e.hours,
                spent_on: e.spent_on,
                activity: e.activity.name,
                comments: e.comments,
              }))
            );
          })
      );
    });
    Promise.all(promises).then(() => {
      const timeEntriesByDate = allTimeSeries
        .flat()
        .reduce((acc, timeEntry) => {
          const date = timeEntry.spent_on;
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(timeEntry);
          return acc;
        }, {});
      setState({ loading: false, timeEntries: timeEntriesByDate });
      chrome.storage?.local.set({ timeEntries: timeEntriesByDate });
    });
  }

  return (
    <div id="time">
      <Button
        onClick={() => {
          loadTimeEntries();
        }}
        class="mb-6"
      >
        Refresh
      </Button>
      <Section title={sectionTitle} classContent="p-2">
        <ul class="weeks-list">
          <For each={state.weeks}>
            {(week) => {
              const firstDay = week[week.length - 1];
              const lastDay = week[0];
              return (
                <li class="weeks-list-item">
                  <p class="week-title">
                    {toLocaleDateString(firstDay)} -{" "}
                    {toLocaleDateString(lastDay)}
                    <span class="week-total">
                      {totals().perWeek[`${firstDay}_${lastDay}`] || 0}h
                    </span>
                  </p>
                  <ul class="days-list">
                    <For each={week}>
                      {(day) => (
                        <li class="days-list-item">
                          <p class="day-title">
                            {toLocaleDateString(day, "en-US", {
                              weekday: "short",
                            })}
                          </p>
                          <div class="day-time">
                            <span class="day-total">
                              {totals().perDay[day] || 0} h
                            </span>
                            <TimeBar
                              day={day}
                              timeEntries={state.timeEntries}
                            />
                          </div>
                        </li>
                      )}
                    </For>
                  </ul>
                </li>
              );
            }}
          </For>
        </ul>
      </Section>
    </div>
  );
}

export default Time;
