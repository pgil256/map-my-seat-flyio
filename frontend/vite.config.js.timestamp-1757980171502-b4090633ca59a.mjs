// vite.config.js
import { defineConfig } from "file:///mnt/c/users/user/desktop/coding/map-my-seat/frontend/node_modules/vite/dist/node/index.js";
import { NodeGlobalsPolyfillPlugin } from "file:///mnt/c/users/user/desktop/coding/map-my-seat/frontend/node_modules/@esbuild-plugins/node-globals-polyfill/dist/index.js";
import { NodeModulesPolyfillPlugin } from "file:///mnt/c/users/user/desktop/coding/map-my-seat/frontend/node_modules/@esbuild-plugins/node-modules-polyfill/dist/index.js";
import rollupNodePolyFill from "file:///mnt/c/users/user/desktop/coding/map-my-seat/frontend/node_modules/rollup-plugin-node-polyfills/dist/index.js";
import react from "file:///mnt/c/users/user/desktop/coding/map-my-seat/frontend/node_modules/@vitejs/plugin-react-swc/index.mjs";
import reactRefresh from "file:///mnt/c/users/user/desktop/coding/map-my-seat/frontend/node_modules/@vitejs/plugin-react-refresh/index.js";
var vite_config_default = defineConfig({
  // build: {
  //   // lib: {
  //   //   // Could also be a dictionary or array of multiple entry points
  //   //   entry: resolve(__dirname, "src/main.jsx"),
  //   //   name: "MyLib",
  //   //   // the proper extensions will be added
  //   //   fileName: "my-lib",
  //   // },
  //   rollupOptions: {
  //     // make sure to externalize deps that shouldn't be bundled
  //     // into your library
  //     external: ["vue"],
  //     output: {
  //       // Provide global variables to use in the UMD build
  //       // for externalized deps
  //       globals: {
  //         vue: "Vue",
  //       },
  //     },
  //     plugins: [
  //       // Enable rollup polyfills plugin
  //       // used during production bundling
  //       rollupNodePolyFill(),
  //     ],
  //   },
  // },
  build: {
    rollupOptions: {
      plugins: [rollupNodePolyFill()]
    }
  },
  plugins: [react(), reactRefresh()],
  resolve: {
    alias: {
      // This Rollup aliases are extracted from @esbuild-plugins/node-modules-polyfill,
      // see https://github.com/remorses/esbuild-plugins/blob/master/node-modules-polyfill/src/polyfills.ts
      // process and buffer are excluded because already managed
      // by node-globals-polyfill
      util: "rollup-plugin-node-polyfills/polyfills/util",
      sys: "util",
      events: "rollup-plugin-node-polyfills/polyfills/events",
      stream: "rollup-plugin-node-polyfills/polyfills/stream",
      path: "rollup-plugin-node-polyfills/polyfills/path",
      querystring: "rollup-plugin-node-polyfills/polyfills/qs",
      punycode: "rollup-plugin-node-polyfills/polyfills/punycode",
      url: "rollup-plugin-node-polyfills/polyfills/url",
      string_decoder: "rollup-plugin-node-polyfills/polyfills/string-decoder",
      http: "rollup-plugin-node-polyfills/polyfills/http",
      https: "rollup-plugin-node-polyfills/polyfills/http",
      os: "rollup-plugin-node-polyfills/polyfills/os",
      assert: "rollup-plugin-node-polyfills/polyfills/assert",
      constants: "rollup-plugin-node-polyfills/polyfills/constants",
      _stream_duplex: "rollup-plugin-node-polyfills/polyfills/readable-stream/duplex",
      _stream_passthrough: "rollup-plugin-node-polyfills/polyfills/readable-stream/passthrough",
      _stream_readable: "rollup-plugin-node-polyfills/polyfills/readable-stream/readable",
      _stream_writable: "rollup-plugin-node-polyfills/polyfills/readable-stream/writable",
      _stream_transform: "rollup-plugin-node-polyfills/polyfills/readable-stream/transform",
      timers: "rollup-plugin-node-polyfills/polyfills/timers",
      console: "rollup-plugin-node-polyfills/polyfills/console",
      vm: "rollup-plugin-node-polyfills/polyfills/vm",
      zlib: "rollup-plugin-node-polyfills/polyfills/zlib",
      tty: "rollup-plugin-node-polyfills/polyfills/tty",
      domain: "rollup-plugin-node-polyfills/polyfills/domain"
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis"
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true
        }),
        NodeModulesPolyfillPlugin()
      ]
    }
  },
  server: {
    host: true,
    port: 8080,
    watch: {
      usePolling: true
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvbW50L2MvdXNlcnMvdXNlci9kZXNrdG9wL2NvZGluZy9tYXAtbXktc2VhdC9mcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL21udC9jL3VzZXJzL3VzZXIvZGVza3RvcC9jb2RpbmcvbWFwLW15LXNlYXQvZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL21udC9jL3VzZXJzL3VzZXIvZGVza3RvcC9jb2RpbmcvbWFwLW15LXNlYXQvZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHsgTm9kZUdsb2JhbHNQb2x5ZmlsbFBsdWdpbiB9IGZyb20gXCJAZXNidWlsZC1wbHVnaW5zL25vZGUtZ2xvYmFscy1wb2x5ZmlsbFwiO1xuaW1wb3J0IHsgTm9kZU1vZHVsZXNQb2x5ZmlsbFBsdWdpbiB9IGZyb20gXCJAZXNidWlsZC1wbHVnaW5zL25vZGUtbW9kdWxlcy1wb2x5ZmlsbFwiO1xuaW1wb3J0IHJvbGx1cE5vZGVQb2x5RmlsbCBmcm9tIFwicm9sbHVwLXBsdWdpbi1ub2RlLXBvbHlmaWxsc1wiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCByZWFjdFJlZnJlc2ggZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXJlZnJlc2hcIjtcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tIFwicGF0aFwiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICAvLyBidWlsZDoge1xuICAvLyAgIC8vIGxpYjoge1xuICAvLyAgIC8vICAgLy8gQ291bGQgYWxzbyBiZSBhIGRpY3Rpb25hcnkgb3IgYXJyYXkgb2YgbXVsdGlwbGUgZW50cnkgcG9pbnRzXG4gIC8vICAgLy8gICBlbnRyeTogcmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjL21haW4uanN4XCIpLFxuICAvLyAgIC8vICAgbmFtZTogXCJNeUxpYlwiLFxuICAvLyAgIC8vICAgLy8gdGhlIHByb3BlciBleHRlbnNpb25zIHdpbGwgYmUgYWRkZWRcbiAgLy8gICAvLyAgIGZpbGVOYW1lOiBcIm15LWxpYlwiLFxuICAvLyAgIC8vIH0sXG4gIC8vICAgcm9sbHVwT3B0aW9uczoge1xuICAvLyAgICAgLy8gbWFrZSBzdXJlIHRvIGV4dGVybmFsaXplIGRlcHMgdGhhdCBzaG91bGRuJ3QgYmUgYnVuZGxlZFxuICAvLyAgICAgLy8gaW50byB5b3VyIGxpYnJhcnlcbiAgLy8gICAgIGV4dGVybmFsOiBbXCJ2dWVcIl0sXG4gIC8vICAgICBvdXRwdXQ6IHtcbiAgLy8gICAgICAgLy8gUHJvdmlkZSBnbG9iYWwgdmFyaWFibGVzIHRvIHVzZSBpbiB0aGUgVU1EIGJ1aWxkXG4gIC8vICAgICAgIC8vIGZvciBleHRlcm5hbGl6ZWQgZGVwc1xuICAvLyAgICAgICBnbG9iYWxzOiB7XG4gIC8vICAgICAgICAgdnVlOiBcIlZ1ZVwiLFxuICAvLyAgICAgICB9LFxuICAvLyAgICAgfSxcbiAgLy8gICAgIHBsdWdpbnM6IFtcbiAgLy8gICAgICAgLy8gRW5hYmxlIHJvbGx1cCBwb2x5ZmlsbHMgcGx1Z2luXG4gIC8vICAgICAgIC8vIHVzZWQgZHVyaW5nIHByb2R1Y3Rpb24gYnVuZGxpbmdcbiAgLy8gICAgICAgcm9sbHVwTm9kZVBvbHlGaWxsKCksXG4gIC8vICAgICBdLFxuICAvLyAgIH0sXG4gIC8vIH0sXG5cbiAgYnVpbGQ6IHtcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBwbHVnaW5zOiBbcm9sbHVwTm9kZVBvbHlGaWxsKCldLFxuICAgIH0sXG4gIH0sXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCByZWFjdFJlZnJlc2goKV0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgLy8gVGhpcyBSb2xsdXAgYWxpYXNlcyBhcmUgZXh0cmFjdGVkIGZyb20gQGVzYnVpbGQtcGx1Z2lucy9ub2RlLW1vZHVsZXMtcG9seWZpbGwsXG4gICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3JlbW9yc2VzL2VzYnVpbGQtcGx1Z2lucy9ibG9iL21hc3Rlci9ub2RlLW1vZHVsZXMtcG9seWZpbGwvc3JjL3BvbHlmaWxscy50c1xuICAgICAgLy8gcHJvY2VzcyBhbmQgYnVmZmVyIGFyZSBleGNsdWRlZCBiZWNhdXNlIGFscmVhZHkgbWFuYWdlZFxuICAgICAgLy8gYnkgbm9kZS1nbG9iYWxzLXBvbHlmaWxsXG4gICAgICB1dGlsOiBcInJvbGx1cC1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMvcG9seWZpbGxzL3V0aWxcIixcbiAgICAgIHN5czogXCJ1dGlsXCIsXG4gICAgICBldmVudHM6IFwicm9sbHVwLXBsdWdpbi1ub2RlLXBvbHlmaWxscy9wb2x5ZmlsbHMvZXZlbnRzXCIsXG4gICAgICBzdHJlYW06IFwicm9sbHVwLXBsdWdpbi1ub2RlLXBvbHlmaWxscy9wb2x5ZmlsbHMvc3RyZWFtXCIsXG4gICAgICBwYXRoOiBcInJvbGx1cC1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMvcG9seWZpbGxzL3BhdGhcIixcbiAgICAgIHF1ZXJ5c3RyaW5nOiBcInJvbGx1cC1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMvcG9seWZpbGxzL3FzXCIsXG4gICAgICBwdW55Y29kZTogXCJyb2xsdXAtcGx1Z2luLW5vZGUtcG9seWZpbGxzL3BvbHlmaWxscy9wdW55Y29kZVwiLFxuICAgICAgdXJsOiBcInJvbGx1cC1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMvcG9seWZpbGxzL3VybFwiLFxuICAgICAgc3RyaW5nX2RlY29kZXI6IFwicm9sbHVwLXBsdWdpbi1ub2RlLXBvbHlmaWxscy9wb2x5ZmlsbHMvc3RyaW5nLWRlY29kZXJcIixcbiAgICAgIGh0dHA6IFwicm9sbHVwLXBsdWdpbi1ub2RlLXBvbHlmaWxscy9wb2x5ZmlsbHMvaHR0cFwiLFxuICAgICAgaHR0cHM6IFwicm9sbHVwLXBsdWdpbi1ub2RlLXBvbHlmaWxscy9wb2x5ZmlsbHMvaHR0cFwiLFxuICAgICAgb3M6IFwicm9sbHVwLXBsdWdpbi1ub2RlLXBvbHlmaWxscy9wb2x5ZmlsbHMvb3NcIixcbiAgICAgIGFzc2VydDogXCJyb2xsdXAtcGx1Z2luLW5vZGUtcG9seWZpbGxzL3BvbHlmaWxscy9hc3NlcnRcIixcbiAgICAgIGNvbnN0YW50czogXCJyb2xsdXAtcGx1Z2luLW5vZGUtcG9seWZpbGxzL3BvbHlmaWxscy9jb25zdGFudHNcIixcbiAgICAgIF9zdHJlYW1fZHVwbGV4OlxuICAgICAgICBcInJvbGx1cC1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMvcG9seWZpbGxzL3JlYWRhYmxlLXN0cmVhbS9kdXBsZXhcIixcbiAgICAgIF9zdHJlYW1fcGFzc3Rocm91Z2g6XG4gICAgICAgIFwicm9sbHVwLXBsdWdpbi1ub2RlLXBvbHlmaWxscy9wb2x5ZmlsbHMvcmVhZGFibGUtc3RyZWFtL3Bhc3N0aHJvdWdoXCIsXG4gICAgICBfc3RyZWFtX3JlYWRhYmxlOlxuICAgICAgICBcInJvbGx1cC1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMvcG9seWZpbGxzL3JlYWRhYmxlLXN0cmVhbS9yZWFkYWJsZVwiLFxuICAgICAgX3N0cmVhbV93cml0YWJsZTpcbiAgICAgICAgXCJyb2xsdXAtcGx1Z2luLW5vZGUtcG9seWZpbGxzL3BvbHlmaWxscy9yZWFkYWJsZS1zdHJlYW0vd3JpdGFibGVcIixcbiAgICAgIF9zdHJlYW1fdHJhbnNmb3JtOlxuICAgICAgICBcInJvbGx1cC1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMvcG9seWZpbGxzL3JlYWRhYmxlLXN0cmVhbS90cmFuc2Zvcm1cIixcbiAgICAgIHRpbWVyczogXCJyb2xsdXAtcGx1Z2luLW5vZGUtcG9seWZpbGxzL3BvbHlmaWxscy90aW1lcnNcIixcbiAgICAgIGNvbnNvbGU6IFwicm9sbHVwLXBsdWdpbi1ub2RlLXBvbHlmaWxscy9wb2x5ZmlsbHMvY29uc29sZVwiLFxuICAgICAgdm06IFwicm9sbHVwLXBsdWdpbi1ub2RlLXBvbHlmaWxscy9wb2x5ZmlsbHMvdm1cIixcbiAgICAgIHpsaWI6IFwicm9sbHVwLXBsdWdpbi1ub2RlLXBvbHlmaWxscy9wb2x5ZmlsbHMvemxpYlwiLFxuICAgICAgdHR5OiBcInJvbGx1cC1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMvcG9seWZpbGxzL3R0eVwiLFxuICAgICAgZG9tYWluOiBcInJvbGx1cC1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMvcG9seWZpbGxzL2RvbWFpblwiLFxuICAgIH0sXG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICAvLyBOb2RlLmpzIGdsb2JhbCB0byBicm93c2VyIGdsb2JhbFRoaXNcbiAgICAgIGRlZmluZToge1xuICAgICAgICBnbG9iYWw6IFwiZ2xvYmFsVGhpc1wiLFxuICAgICAgfSxcbiAgICAgIC8vIEVuYWJsZSBlc2J1aWxkIHBvbHlmaWxsIHBsdWdpbnNcbiAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgTm9kZUdsb2JhbHNQb2x5ZmlsbFBsdWdpbih7XG4gICAgICAgICAgcHJvY2VzczogdHJ1ZSxcbiAgICAgICAgICBidWZmZXI6IHRydWUsXG4gICAgICAgIH0pLFxuICAgICAgICBOb2RlTW9kdWxlc1BvbHlmaWxsUGx1Z2luKCksXG4gICAgICBdLFxuICAgIH0sXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IHRydWUsXG4gICAgcG9ydDogODA4MCxcbiAgICB3YXRjaDoge1xuICAgICAgdXNlUG9sbGluZzogdHJ1ZSxcbiAgICB9LFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWlWLFNBQVMsb0JBQW9CO0FBQzlXLFNBQVMsaUNBQWlDO0FBQzFDLFNBQVMsaUNBQWlDO0FBQzFDLE9BQU8sd0JBQXdCO0FBQy9CLE9BQU8sV0FBVztBQUNsQixPQUFPLGtCQUFrQjtBQUd6QixJQUFPLHNCQUFRLGFBQWE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUE0QjFCLE9BQU87QUFBQSxJQUNMLGVBQWU7QUFBQSxNQUNiLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQztBQUFBLElBQ2hDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUyxDQUFDLE1BQU0sR0FBRyxhQUFhLENBQUM7QUFBQSxFQUNqQyxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUtMLE1BQU07QUFBQSxNQUNOLEtBQUs7QUFBQSxNQUNMLFFBQVE7QUFBQSxNQUNSLFFBQVE7QUFBQSxNQUNSLE1BQU07QUFBQSxNQUNOLGFBQWE7QUFBQSxNQUNiLFVBQVU7QUFBQSxNQUNWLEtBQUs7QUFBQSxNQUNMLGdCQUFnQjtBQUFBLE1BQ2hCLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQSxNQUNQLElBQUk7QUFBQSxNQUNKLFFBQVE7QUFBQSxNQUNSLFdBQVc7QUFBQSxNQUNYLGdCQUNFO0FBQUEsTUFDRixxQkFDRTtBQUFBLE1BQ0Ysa0JBQ0U7QUFBQSxNQUNGLGtCQUNFO0FBQUEsTUFDRixtQkFDRTtBQUFBLE1BQ0YsUUFBUTtBQUFBLE1BQ1IsU0FBUztBQUFBLE1BQ1QsSUFBSTtBQUFBLE1BQ0osTUFBTTtBQUFBLE1BQ04sS0FBSztBQUFBLE1BQ0wsUUFBUTtBQUFBLElBQ1Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixnQkFBZ0I7QUFBQTtBQUFBLE1BRWQsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLE1BQ1Y7QUFBQTtBQUFBLE1BRUEsU0FBUztBQUFBLFFBQ1AsMEJBQTBCO0FBQUEsVUFDeEIsU0FBUztBQUFBLFVBQ1QsUUFBUTtBQUFBLFFBQ1YsQ0FBQztBQUFBLFFBQ0QsMEJBQTBCO0FBQUEsTUFDNUI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsWUFBWTtBQUFBLElBQ2Q7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
