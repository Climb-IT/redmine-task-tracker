import { createSignal, onMount, For } from "solid-js";
import Section from "../components/Section";
import Input from "../components/Input";
import Button from "../components/Button";

function Redmine(props) {
  const [isEdit, setIsEdit] = createSignal(false);

  const fields = [
    {
      label: "Title",
      id: "title",
      type: "text",
      value: props.title,
    },
    {
      label: "URL",
      id: "url",
      type: "text",
      value: props.url,
    },
    {
      label: "API-Key",
      id: "apiKey",
      type: "password",
      value: props.apiKey,
    },
  ];

  return (
    <div class="redmine-site">
      {isEdit() && (
        <div class="flex flex-col rounded border border-dotted border-sky-600 p-2">
          <For each={fields}>
            {(field) => (
              <Input
                label={field.label}
                id={field.id}
                type={field.type}
                value={field.value}
                onChange={(e) => props.onChange(field.id, e.target.value)}
              />
            )}
          </For>
        </div>
      )}
      {!isEdit() && (
        <div class="flex items-center space-x-2 justify-between">
          <div class="flex items-center space-x-2">
            <img src="redmine.png" alt="" class="w-4 h-4" />
            <span>{props.title || props.url || "New site"}</span>
          </div>
          <div class="flex space-x-2">
            <Button onClick={() => setIsEdit(true)} class="small-btn">
              Edit
            </Button>
            <Button onClick={() => props.onDelete()} class="small-btn">
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function RedmineSection(props) {
  return (
    <Section title="Redmine sites" classContent="flex flex-col my-2 space-y-4">
      <For each={props.sites}>
        {(site, index) => (
          <Redmine
            title={site.title}
            url={site.url}
            apiKey={site.apiKey}
            onChange={(key, value) => {
              props.setState("sites", index(), key, value);
            }}
            onDelete={() =>
              props.setState((state) => ({
                ...state,
                sites: state.sites.toSpliced(index(), 1),
              }))
            }
          />
        )}
      </For>
      <div class="flex space-x-2">
        <Button
          onClick={() => {
            props.setState("sites", [
              ...props.sites,
              { title: "", url: "", apiKey: "" },
            ]);
          }}
        >
          Add site
        </Button>
      </div>
    </Section>
  );
}

export default RedmineSection;
