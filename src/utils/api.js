export const proxyUrl =
  import.meta.env.MODE === "development" ? "/__vite_dev_proxy__?url=" : "";
