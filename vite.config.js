const { defineConfig } = require('vite');

module.exports = defineConfig({
  plugins: [react()],
  define: {
    "process.env": {},
    global: {},
  },
  resolve: {
    alias: {
      process: "process/browser",
      stream: "stream-browserify",
      zlib: "browserify-zlib",
      util: "util",
    },
  },
  build: {
    rollupOptions: {
      external: ["fsevents"],
    },
  },
  optimizeDeps: {
    include: ["buffer"],
  },
});
