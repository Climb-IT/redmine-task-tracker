import { createContext, useContext, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { getCurrentMonth } from "./utils";

export const StoreContext = createContext();

const _localStorage = {
  get: async (key) => {
    return new Promise((resolve) => {
      resolve({
        [key]: JSON.parse(localStorage.getItem(key)),
      });
    });
  },
  set: async (obj) => {
    return new Promise((resolve) => {
      Object.entries(obj).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
      resolve();
    });
  },
  onChanged: {
    addListener: () => {},
    removeListener: () => {},
  },
};

export const storage = chrome.storage?.local || _localStorage;

export function StoreProvider(props) {
  const [state, setState] = createStore({
    sites: [],
    loading: false,
    loaded: false,
    errors: [],
    lastRefresh: 0,
    currentMonth: getCurrentMonth(),
  });

  const setSites = (sites) => setState("sites", sites);
  const setLoading = (loading) => setState("loading", loading);
  const setLoaded = (loaded, errors = []) => {
    setState((state) => ({
      loaded,
      loading: false,
      ...(loaded ? { errors: [] } : { errors: [...state.errors, ...errors] }),
    }));
  };
  const setErrors = (errors) => setState("errors", errors);
  const setError = (error) =>
    setState((state) => ({ errors: [...state.errors, error] }));

  const store = [
    state,
    {
      setStore: setState,
      setSites,
      setLoading,
      setLoaded,
      setErrors,
      setError,
    },
  ];

  async function loadLocalStorage() {
    setState({
      sites: (await storage.get("sites")).sites || [],
      lastRefresh: (await storage.get("lastRefresh")).lastRefresh || 0,
    });
  }

  // function onLocalStorageChanged(changes) {
  //   if (changes.sites) {
  //     loadLocalStorage();
  //   }
  // }

  onMount(() => {
    loadLocalStorage();
    // chrome.storage?.local.onChanged.addListener(onLocalStorageChanged);
  });

  // onCleanup(() => {
  //   chrome.storage?.local.onChanged.removeListener(onLocalStorageChanged);
  // });

  return (
    <StoreContext.Provider value={store}>
      {props.children}
    </StoreContext.Provider>
  );
}

export function useSites() {
  const [store, { setSites }] = useContext(StoreContext);
  return [store.sites, setSites];
}

export function useCurrentMonth() {
  const [store] = useContext(StoreContext);
  return store.currentMonth;
}

export default function useStore() {
  const store = useContext(StoreContext);
  return store;
}
