export default function load(sites, from, to) {
  return new Promise((resolve, reject) => {
    const allTimeSeries = [];
    const promises = [];
    sites.forEach((site) => {
      promises.push(
        fetch(
          `${site.url}/time_entries.json?user_id=me&sort=updated_on:desc&from=${from}&to=${to}&limit=1000`,
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
      chrome.storage?.local.set({ timeEntries: timeEntriesByDate });
      resolve(timeEntriesByDate);
    });
  });
}
