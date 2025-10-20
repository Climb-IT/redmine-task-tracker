import { For } from "solid-js/web";
import Section from "../components/Section";

function Issues(props) {
  return (
    <div id="issues">
      <For each={props.store.sites}>
        {(site) => (
          <Section title={site.title || site.url} class="p-2">
            <ul class="flex flex-col">
              <For each={props.store.issues}>
                {(issue) => (
                  <li title={`${issue.assigned_to.name} - ${issue.subject}`}>
                    <p class="text-base truncate">
                      <a
                        href={`${site.url}/issues/${issue.id}`}
                        class="hover:underline cursor-pointer text-sky-600"
                        target="_blank"
                      >
                        #{issue.id}
                      </a>{" "}
                      {issue.subject}
                    </p>
                    <div class="text-xs flex space-x-2 space-y-2">
                      <p>
                        <span>Asignee:</span> {issue.assigned_to.name}
                      </p>
                      <p>
                        <span>Priority:</span> {issue.priority.name}
                      </p>
                    </div>
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
