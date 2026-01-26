import { proxyUrl } from '@/utils/api';

function serializeTimeEntry(timeEntry, site) {
  return {
    id: timeEntry.id,
    issue_id: timeEntry.issue.id,
    url: `${site.url}/issues/${timeEntry.issue.id}`,
    hours: timeEntry.hours,
    spent_on: timeEntry.spent_on,
    activity: timeEntry.activity.name,
    comments: timeEntry.comments,
    project: timeEntry.project.name,
    custom_fields: timeEntry.custom_fields,
  };
}

async function fetchTimeEntries(site, from, to, offset = 0, limit = 100) {
  try {
    const response = await fetch(
      `${proxyUrl}${site.url}/time_entries.json?user_id=me&sort=updated_on:desc&from=${from}&to=${to}&offset=${offset}&limit=${limit}`,
      {
        headers: {
          'X-Redmine-API-Key': site.apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const filteredProjects =
      site.filteredProjects?.split(',').map((p) => p.trim().toLowerCase()) ||
      [];

    let entries = data.time_entries
      .filter(
        (entry) =>
          !filteredProjects.includes(
            !!entry.issue?.id && entry.project.name.toLowerCase()
          )
      )
      .map((entry) => serializeTimeEntry(entry, site));
    // If there are more entries to fetch
    if (data.total_count > offset + limit) {
      const nextOffset = offset + limit;
      const nextEntries = await fetchTimeEntries(
        site,
        from,
        to,
        nextOffset,
        limit
      );
      entries = [...entries, ...nextEntries];
    }

    return entries;
  } catch (error) {
    throw new Error(`Error fetching time entries from ${site.url}: ${error}`);
  }
}

export default async function loadTimeEntries(sites, from, to) {
  try {
    const promises = sites.map((site) => fetchTimeEntries(site, from, to));

    const results = await Promise.all(promises);

    // Group by date
    const timeEntriesByDate = results.map((entries) =>
      entries.reduce((acc, timeEntry) => {
        const date = timeEntry.spent_on;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(timeEntry);
        return acc;
      }, {})
    );

    return timeEntriesByDate;
  } catch (error) {
    throw error;
  }
}
