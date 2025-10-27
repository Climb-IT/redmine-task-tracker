import { createSignal, For } from "solid-js";
import Section from "@/ui/Section";
import { Button, Input, Modal, Icon } from "@/ui";
import EditIcon from "@/assets/Edit.jsx";
import DeleteIcon from "@/assets/Delete.jsx";

function Redmine(props) {
  const [isEdit, setIsEdit] = createSignal(false);

  function getValue(key) {
    return props[key];
  }

  const fields = [
    {
      label: "Title",
      name: "title",
      type: "text",
    },
    {
      label: "URL",
      name: "url",
      type: "text",
    },
    {
      label: "API-Key",
      name: "apiKey",
      type: "password",
    },
    {
      label: "Color",
      name: "color",
      type: "text",
    },
    {
      label: "Filtered projects",
      name: "filteredProjects",
      type: "text",
    },
  ];

  return (
    <div class="redmine-site">
      <div class="flex items-center space-x-2">
        <div class="flex items-center space-x-2">
          <img src="redmine.png" alt="" class="w-4 h-4" />
          <span>{props.title || props.url || "New site"}</span>
        </div>
        <div class="flex space-x-2">
          <Icon
            onClick={() => setIsEdit(true)}
            size="16px"
            color="var(--color-sky-600)"
          >
            <EditIcon />
          </Icon>
          <Icon
            onClick={() => props.onDelete()}
            size="16px"
            color="var(--color-sky-600)"
          >
            <DeleteIcon />
          </Icon>
        </div>
      </div>
      <Modal
        open={isEdit()}
        actions={<Button onClick={() => setIsEdit(false)}>Done</Button>}
        height="fit-content"
      >
        <div class="flex flex-col space-y-2">
          <For each={fields}>
            {(field) => (
              <Input
                label={field.label}
                name={field.name}
                type={field.type}
                value={getValue(field.name)}
                onChange={(e) => props.onChange(field.name, e.target.value)}
              />
            )}
          </For>
        </div>
      </Modal>
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
            color={site.color || ""}
            filteredProjects={site.filteredProjects || ""}
            onChange={(key, value) =>
              props.setState("sites", index(), key, value)
            }
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
