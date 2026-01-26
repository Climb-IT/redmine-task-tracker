import { proxyUrl } from '@/utils/api';

function serializeIssue(issue, site) {
  return {
    ...issue,
  };
}

async function fetchIssues(site, userId, offset = 0, limit = 100) {
  try {
    const response = await fetch(
      `${proxyUrl}${site.url}/issues.json?assigned_to_id=${
        userId || 'me'
      }&sort=priority:desc,status:desc,updated_on:desc&limit=${limit}&offset=${offset}`,
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
    let issues = data.issues.map((issue) => serializeIssue(issue, site));

    // If there are more issues to fetch
    if (data.total_count > offset + limit) {
      const nextOffset = offset + limit;
      const nextIssues = await fetchIssues(site, userId, nextOffset, limit);
      issues = [...issues, ...nextIssues];
    }

    return issues;
  } catch (error) {
    throw new Error(`Error fetching issues from ${site.url}: ${error}`);
  }
}

export async function fetchIssuesByIds(site, ids, offset = 0, limit = 100) {
  try {
    const response = await fetch(
      `${proxyUrl}${site.url}/issues.json?issue_id=${ids.join(
        ','
      )}&status_id=*&limit=${limit}&offset=${offset}&`,
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
    let issues = data.issues;

    // If there are more issues to fetch
    if (data.total_count > offset + limit) {
      const nextOffset = offset + limit;
      const nextIssues = await fetchIssuesByIds(site, ids, nextOffset, limit);
      issues = [...issues, ...nextIssues];
    }

    return issues;
  } catch (error) {
    throw new Error(`Error fetching issues from ${site.url}: ${error}`);
  }
}

export default async function loadIssues(sites, users = []) {
  try {
    const promises = sites.map((site, index) =>
      fetchIssues(site, users[index]?.id)
    );

    const results = await Promise.all(promises);

    return results;
  } catch (error) {
    throw error;
  }
}
