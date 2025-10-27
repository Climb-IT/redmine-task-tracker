import { createMemo, createEffect } from "solid-js";
import { For } from "solid-js/web";
import Section from "@/ui/Section";
import { toLocaleDateString } from "@/utils";
import useStore from "@/store";
import { Tooltip } from "@/ui";

const HOURS_PER_DAY = 8;

function TimeBar(props) {
  const widths = createMemo(() =>
    (props.timeEntries()[props.day] || []).map((entry) => [
      (entry.hours / HOURS_PER_DAY) * 100,
      entry,
    ])
  );
  const totalWidth = createMemo(() =>
    widths().reduce((sum, [w]) => sum + w, 0)
  );

  return (
    <div class="time-bar">
      <For each={widths()}>
        {([w, entry]) => (
          <Tooltip
            trigger={
              <a
                href={entry.url}
                class="time-bar-fill"
                style={{ width: `${w}%`, "--time-bar-fill-color": entry.color }}
                target="_blank"
              />
            }
          >
            <div class="bg-slate-600 text-white rounded p-2">
              <p>Project: {entry.project}</p>
              <p>Time: {entry.hours}h</p>
            </div>
          </Tooltip>
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
  const [store] = useStore();
  const month = store.currentMonth;

  const timeEntries = createMemo(() => {
    return store.sites.reduce((acc, site) => {
      Object.entries(site.timeEntries).forEach(([day, entries]) => {
        if (!acc[day]) {
          acc[day] = [];
        }
        acc[day].push(
          ...entries.map((entry) => ({ ...entry, color: site.color }))
        );
      });
      return acc;
    }, {});
  });

  // ✅ Compute total hours per day and per week reactively
  const totals = createMemo(() => {
    let overall = 0;
    const perDay = {};
    const perWeek = {};

    // Precompute totals for each day
    for (const [date, entries] of Object.entries(timeEntries() || {})) {
      perDay[date] = entries.reduce((sum, e) => sum + e.hours, 0);
      overall += perDay[date];
    }

    // Precompute totals for each week
    for (const week of month.weeks) {
      const weekKey = `${week[week.length - 1]}_${week[0]}`;
      perWeek[weekKey] = week.reduce((sum, day) => sum + (perDay[day] || 0), 0);
    }

    return { perDay, perWeek, overall };
  });

  const sectionTitle = createMemo(() => `Spent time ${totals().overall}h`);

  return (
    <div id="time">
      <Section title={sectionTitle} classContent="p-2">
        <ul class="weeks-list">
          <For each={month.weeks}>
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
                            <TimeBar day={day} timeEntries={timeEntries} />
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
