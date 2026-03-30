import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 98,
        host: '0.0.0.0',
        strictPort: true,

        allowedHosts: ['facumapp-administracion.frlp.utn.edu.ar'],
        hmr: {
            host: 'facumapp-administracion.frlp.utn.edu.ar',
            clientPort: 98
        }
    }
})