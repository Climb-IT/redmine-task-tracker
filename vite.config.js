import { defineConfig } from "vite";
import path from "path";
import solid from "vite-plugin-solid";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";

function proxy() {
  return {
    configureServer(server) {
      server.middlewares.use("/__vite_dev_proxy__", async (req, res) => {
        try {
          const targetUrl = decodeURIComponent(req.url.split("url=")[1]);
          const url = new URL(targetUrl);

          const fetchOptions = {
            method: req.method,
            headers: { ...req.headers },
            body:
              req.method !== "GET" && req.method !== "HEAD" ? req : undefined,
          };

          // Clean headers
          delete fetchOptions.headers.host;
          delete fetchOptions.headers.origin;
          delete fetchOptions.headers.referer;

          const proxyRes = await fetch(url.href, fetchOptions);

          res.statusCode = proxyRes.status;
          for (const [key, value] of proxyRes.headers.entries()) {
            if (key.toLowerCase() !== "content-encoding") {
              res.setHeader(key, value);
            }
          }

          const body = Buffer.from(await proxyRes.arrayBuffer());
          res.end(body);
        } catch (e) {
          res.statusCode = 500;
          res.end("Proxy error");
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [solid(), tailwindcss(), proxy()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
      },
    },
  },
});
