# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Configuración de Supabase

1. Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```plaintext
   VITE_SUPABASE_URL=https://udebptpvbrhcsaytokuy.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZWJwdHB2YnJoY3NheXRva3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzQ2NjUsImV4cCI6MjA1ODQxMDY2NX0.6v6DUb9L73cPeVp-BtKjNF-rFa-EQ6Pv54F1W3xTNhE
   ```
2. Asegúrate de que el archivo `.env` esté en tu `.gitignore`.
3. Usa la instancia de Supabase (`supabase`) para interactuar con tu base de datos.

```javascript
import { supabase } from './supabaseClient';
```
