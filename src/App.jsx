import { createSignal, createMemo } from 'solid-js';
import { Issues, Time, Settings } from './sections';
import { Tooltip, Icon } from './ui';
import {
  loadUsers,
  loadIssues,
  loadTimeEntries,
  fetchIssuesByIds,
} from './api';
import useStore, { storage } from './store';
import RefreshIcon from '@/assets/Refresh';
import DownloadIcon from '@/assets/Download';
import { arrayToCSV, downloadCSV } from './utils';

const tabs = [
  { name: 'Issues', component: Issues },
  { name: 'Time', component: Time },
  { name: 'Settings', component: Settings },
];

function App() {
  const [store, { setStore, setLoading, setLoaded }] = useStore();
  const month = store.currentMonth;
  const [tab, setTab] = createSignal('Issues');
  const activeTab = createMemo(() => tabs.find((t) => t.name === tab()));

  async function refresh() {
    setLoading(true);
    try {
      let users = store.sites.map((site) => site.user);
      if (!users.length) {
        users = await loadUsers(store.sites);
      }
      const issues = await loadIssues(store.sites, users);
      const timeEntries = await loadTimeEntries(
        store.sites,
        month.from,
        month.to
      );
      const lastRefresh = Date.now();
      const newStore = {
        sites: store.sites.map((site, index) => ({
          ...site,
          user: users[index],
          issues: issues[index],
          timeEntries: timeEntries[index],
        })),
        lastRefresh,
      };
      storage.set(newStore);
      setStore({
        ...newStore,
        loaded: true,
        loading: false,
        errors: [],
      });
    } catch (error) {
      console.error(error);
      setLoaded(false, [error]);
    }
  }

  return (
    <div id="redmine-task-tracker">
      <div class="tabs-menu">
        {tabs.map((t) => (
          <button
            onClick={() => setTab(t.name)}
            classList={{ 'tab-btn': true, active: t.name === tab() }}
          >
            {t.name}
          </button>
        ))}
        <Tooltip
          trigger={
            <Icon
              onClick={refresh}
              size="20px"
              classList={{ loading: store.loading }}
            >
              <RefreshIcon />
            </Icon>
          }
        >
          <div class="bg-sky-600 text-white rounded p-2">
            <p>
              {store.lastRefresh !== 0
                ? new Date(store.lastRefresh).toLocaleString()
                : 'Refresh data'}
            </p>
          </div>
        </Tooltip>
        <Icon
          size="20px"
          onClick={async () => {
            try {
              const siteIssueMap = new Map();
              const custom_fields = new Set();
              const entries = [];

              for (const site of store.sites) {
                const issueIds = new Set();
                for (const entriesArr of Object.values(site.timeEntries)) {
                  for (const entry of entriesArr) {
                    entries.push({
                      ...entry,
                      spent_on: new Date(entry.spent_on).toLocaleDateString(
                        'en-GB'
                      ),
                      site_url: site.url,
                      user_id: site.user.id,
                      user_fullname:
                        `${site.user.firstname} ${site.user.lastname}`.trim(),
                      user_login: site.user.login,
                      ...(entry.custom_fields?.reduce((acc, field) => {
                        acc[field.name] = field.value;
                        custom_fields.add(field.name);
                        return acc;
                      }, {}) || {}),
                    });
                    issueIds.add(entry.issue_id);
                  }
                }
                if (issueIds.size > 0)
                  siteIssueMap.set(site.url, { site, issueIds });
              }

              const issuesMap = new Map();

              await Promise.all(
                Array.from(siteIssueMap.values()).map(
                  async ({ site, issueIds }) => {
                    const issues = await fetchIssuesByIds(
                      site,
                      Array.from(issueIds)
                    );
                    for (const issue of issues) {
                      issuesMap.set(`${issue.id}_${site.url}`, {
                        ...issue,
                        _siteUrl: site.url,
                      });
                    }
                  }
                )
              );

              const entriesWithIssues = entries.map((entry) => {
                const issue = issuesMap.get(
                  `${entry.issue_id}_${entry.site_url}`
                );
                return {
                  ...entry,
                  issue,
                  issue_name: `#${issue.id} ${issue.subject}`,
                };
              });
              const csv = arrayToCSV(entriesWithIssues, [
                { key: 'project', name: 'Project' },
                { key: 'spent_on', name: 'Date' },
                { key: 'user_id', name: 'User ID' },
                { key: 'user_fullname', name: 'User Fullname' },
                { key: 'user_login', name: 'User Login' },
                { key: 'activity', name: 'Activity' },
                { key: 'issue_name', name: 'Issue' },
                { key: 'comments', name: 'Comments' },
                { key: 'hours', name: 'Hours' },
                ...Array.from(custom_fields).map((field) => ({
                  key: field,
                  name: field,
                })),
              ]);
              downloadCSV(csv, `Timesheet (${month.from} - ${month.to}).csv`);
            } catch (error) {
              throw error;
            }
          }}
        >
          <DownloadIcon />
        </Icon>
      </div>
      <div class="tab-content">{activeTab()?.component({ store }) || null}</div>
    </div>
  );
}

export default App;
