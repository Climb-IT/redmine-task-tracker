export default function load(sites) {
  return new Promise((resolve, reject) => {
    sites.forEach((site) => {
      fetch(`${site.url}/issues.json?assigned_to_id=me&limit=100`, {
        headers: {
          "X-Redmine-API-Key": site.apiKey,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          const issues = data.issues;
          chrome.storage?.local.set({ issues });
          resolve(issues);
        });
    });
  });
}
