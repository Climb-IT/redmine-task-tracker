// const [issues, setIssues] = createSignal([]);
// const [loading, setLoading] = createSignal(false);
// const [error, setError] = createSignal(null);

// const fetchIssues = async (url, apiKey) => {
// setLoading(true);
// setError(null);
// try {
// const res = await fetch(`${url}/issues.json?assigned_to_id=me`, {
// headers: { "X-Redmine-API-Key": apiKey },
// });
// if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
// const data = await res.json();
// setIssues(data.issues || []);
// } catch (e) {
// setError(e.message);
// }
// setLoading(false);
// };

// onMount(() => {
// chrome.storage.sync.get(["redmineUrl", "apiKey"], (items) => {
// if (!items.redmineUrl || !items.apiKey) {
// setError("Please configure settings first.");
// return;
// }
// fetchIssues(items.redmineUrl, items.apiKey);
// });
// });
