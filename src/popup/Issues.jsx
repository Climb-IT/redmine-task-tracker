import { onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { For } from "solid-js/web";
import Section from "../components/Section";
import Button from "../components/Button";

function Issues() {
  const [state, setState] = createStore({
    sites: [],
    issues: [],
    loading: false,
  });

  onMount(() => {
    chrome.storage?.local.get("redmineSites", (result) => {
      const sites = result.redmineSites;
      setState("sites", Array.isArray(sites) ? sites : []);
    });
    chrome.storage?.local.get("issues", (result) => {
      const issues = result.issues;
      setState("issues", Array.isArray(issues) ? issues : []);
    });
  });

  function loadIssues() {
    setState("loading", true);
    state.sites.forEach((site) => {
      fetch(`${site.url}/issues.json?assigned_to_id=me&limit=100`, {
        headers: {
          "X-Redmine-API-Key": site.apiKey,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setState("issues", data.issues);
          chrome.storage?.local.set({ issues: data.issues });
        });
    });
    setState("loading", false);
  }

  return (
    <div id="issues">
      <Button
        onClick={() => {
          loadIssues();
        }}
        class="mb-6"
      >
        Refresh
      </Button>
      <For each={state.sites}>
        {(site) => (
          <Section title={site.title}>
            <ul>
              <For each={state.issues}>
                {(issue) => (
                  <li>
                    <a
                      href={`${site.url}/issues/${issue.id}`}
                      class="hover:underline cursor-pointer text-sky-600"
                      target="_blank"
                    >
                      #{issue.id}
                    </a>{" "}
                    {issue.assigned_to.name}
                  </li>
                )}
              </For>
            </ul>
          </Section>
        )}
      </For>
    </div>
  );
}

export default Issues;
