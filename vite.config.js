import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// .dat.gz 辞書ファイルがVite開発サーバーによって自動解凍され、バイナリが破損するのを防ぐプラグイン
const rawGzipPlugin = () => ({
  name: 'raw-gzip',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url && req.url.includes('.dat.gz')) {
        // Content-Encoding を identity に設定して生バイナリをブラウザに渡す
        res.setHeader('Content-Encoding', 'identity');
      }
      next();
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    rawGzipPlugin()
  ],
  server: {
    // WSL2環境とWindows側ファイルシステムの連携でファイル変更検知(HMR)を確実に動かすためのポーリング設定
    watch: {
      usePolling: true,
      interval: 100
    }
  }
})
