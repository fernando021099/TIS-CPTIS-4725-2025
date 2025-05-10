import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
// import tailwindcss from '@tailwindcss/vite'; // Puedes eliminar esta línea si no usarás Tailwind en el backend

export default defineConfig({
    plugins: [
        laravel({
            input: [], // Vaciar este array
            refresh: true,
        }),
        // tailwindcss(), // Puedes eliminar esta línea si no usarás Tailwind en el backend
    ],
});
