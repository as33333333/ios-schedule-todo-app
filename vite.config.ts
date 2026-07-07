import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  base: mode === 'github' ? '/ios-schedule-todo-app/' : '/',
  plugins: [react()],
  server: {
    port: 5173
  }
}));
