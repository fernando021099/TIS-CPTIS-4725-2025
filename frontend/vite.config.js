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
      // Polyfills específicos para xlsx
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
    include: ['xlsx', 'xlsx-style'], // Agregado xlsx-style por si es necesario
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      // Opcional: Si necesitas soporte para crypto
      plugins: [
        {
          name: 'fix-node-globals-polyfill',
          setup(build) {
            build.onResolve({ filter: /_virtual-process-polyfill_\.js/ }, ({ path }) => ({ path }))
          }
        }
      ],
      // Añadido para mejor soporte de Node
      target: 'es2020',
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
      // Añadido para mejor compatibilidad
      exclude: ['xlsx-style'], // Excluir si causa problemas
    },
    rollupOptions: {
      // Opcional: para manejar dependencias pesadas
      external: ['fs'], // xlsx a veces intenta usar fs
    }
  },
  resolve: {
    alias: {
      // Añadido para mejor compatibilidad
      './cptable': 'xlsx/dist/cpexcel.js',
    }
  }
})