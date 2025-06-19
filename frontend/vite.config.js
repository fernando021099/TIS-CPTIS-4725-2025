import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  css: {
    postcss: './postcss.config.cjs' // Ruta explícita al archivo
  },
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        process: true,
        global: true,
      },
      protocolImports: true,
    })
  ],
  define: {
    'process.env': {},
    global: 'window',
    'process.env.NODE_DEBUG': JSON.stringify(''),
  },
  optimizeDeps: {
    include: ['exceljs'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      plugins: [
        {
          name: 'fix-node-globals-polyfill',
          setup(build) {
            build.onResolve({ filter: /_virtual-process-polyfill_\.js/ }, ({ path }) => ({ path }))
          }
        }
      ],
      target: 'es2020',
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: ['fs'],
    }
  },
  resolve: {
    alias: {
      // aquí tus alias si necesitas
    }
  },
  // Agrega esta sección para definir el servidor de desarrollo
  server: {
    host: 'localhost',
    port: 3000,
    strictPort: true, // falla si el puerto está ocupado
    open: true, // abre el navegador automáticamente
  }
})
