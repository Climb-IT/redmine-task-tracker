import { createMemo } from "solid-js";
import { For } from "solid-js/web";
import Section from "@/ui/Section";
import { useSites } from "@/store";

function getTrackerName(name) {
  return name.toLowerCase().replace(" ", "-");
}

function Issues() {
  const [sites] = useSites();

  const issues = createMemo(() =>
    sites.reduce((acc, site) => {
      return [...acc, ...site.issues];
    }, [])
  );

  return (
    <div id="issues">
      <For each={sites}>
        {(site) => (
          <Section
            title={site.title || site.url}
            color={site.color}
            classContent="p-2"
          >
            <div class="issues-list grid grid-cols-[auto_1fr] gap-x-2 gap-y-3 items-start">
              <For each={site.issues}>
                {(issue) => (
                  <>
                    <a
                      href={`${site.url}/issues/${issue.id}`}
                      class={`issue-link inline-block text-center w-full ${getTrackerName(
                        issue.tracker.name
                      )}`}
                      target="_blank"
                    >
                      #{issue.id}
                    </a>
                    <div class="issue-details min-w-0">
                      <p class="text-base/5 truncate mb-1">{issue.subject}</p>
                      <div class="text-xs flex items-center space-x-2">
                        <div class="relative w-[60px] h-4 bg-slate-600">
                          <div
                            class="h-full bg-sky-600"
                            style={{ width: `${issue.done_ratio}%` }}
                          />
                          <span class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs">
                            {issue.done_ratio}%
                          </span>
                        </div>
                        <p>{issue.priority.name}</p>
                        <p>{issue.status.name}</p>
                      </div>
                    </div>
                  </>
                )}
              </For>
            </div>
          </Section>
        )}
      </For>
    </div>
  );
}

export default Issues;
