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
      // Polyfills específicos
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
    include: ['exceljs'], // Actualizado para incluir solo exceljs o lo que realmente uses
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
      // Eliminada la exclusión de xlsx-style
    },
    rollupOptions: {
      // Opcional: para manejar dependencias pesadas
      external: ['fs'], 
    }
  },
  resolve: {
    alias: {
      // Eliminado el alias para './cptable'
    }
  }
})