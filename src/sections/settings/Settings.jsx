import { createStore } from "solid-js/store";
import { Button } from "@/ui";
import useStore, { storage } from "@/store";
import RedmineSection from "./Redmine";

function Settings() {
  const [store, { setStore }] = useStore();
  const [state, setState] = createStore({
    sites: store.sites.map((site) => ({ ...site })),
  });

  function onSave() {
    storage.set({
      sites: state.sites.filter((s) => s.url && s.apiKey),
    });
    setStore({ sites: state.sites });
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
