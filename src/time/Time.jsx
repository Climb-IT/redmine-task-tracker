import { createMemo } from "solid-js";
import { For } from "solid-js/web";
import Section from "../components/Section";

const HOURS_PER_DAY = 8;

function toLocaleDateString(date, ...options) {
  return new Date(date).toLocaleDateString(...options);
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

function Time(props) {
  // ✅ Compute total hours per day and per week reactively
  const totals = createMemo(() => {
    let overall = 0;
    const perDay = {};
    const perWeek = {};

    // Precompute totals for each day
    for (const [date, entries] of Object.entries(
      props.store.timeEntries || {}
    )) {
      perDay[date] = entries.reduce((sum, e) => sum + e.hours, 0);
      overall += perDay[date];
    }

    // Precompute totals for each week
    for (const week of props.store.weeks) {
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
          <For each={props.store.weeks}>
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
                              timeEntries={props.store.timeEntries}
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
