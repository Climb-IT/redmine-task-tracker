import { onMount } from "solid-js";
import { createStore } from "solid-js/store";
import RedmineSection from "./Redmine";
import Button from "../components/Button";

function Settings() {
  const [state, setState] = createStore({
    sites: [],
  });

  onMount(() => {
    chrome.storage?.local.get("redmineSites", (result) => {
      const sites = result.redmineSites;
      setState({ sites: Array.isArray(sites) ? sites : [] });
    });
  });

  function onSave() {
    chrome.storage?.local.set({
      redmineSites: state.sites.filter((s) => s.url && s.apiKey),
    });
  }

  return (
    <div id="settings">
      <p class="text-sm text-slate-400 mb-8">
        Your Redmine API key is stored locally in your browser and never sent
        anywhere except to your Redmine server.
      </p>
      <RedmineSection sites={state.sites} setState={setState} />
      <Button onClick={onSave} class="mt-4 block w-full">
        Save
      </Button>
    </div>
  );
}

export default Settings;
