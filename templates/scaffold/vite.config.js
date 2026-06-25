import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import zipPack from '@adjfut/vite-plugin-zip-pack';
import net from "net";

/**
 * 检测端口是否可用，不可用时自动递增直到找到空闲端口
 * 多页面同时开发时避免端口冲突
 */
function findAvailablePort(startPort) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on("error", () => resolve(findAvailablePort(startPort + 1)));
  });
}

const BASE_PORT = 5173;

export default defineConfig(async () => {
  const port = await findAvailablePort(BASE_PORT);
  if (port !== BASE_PORT) {
    console.log(`[webgen] 端口 ${BASE_PORT} 已占用，自动切换到 ${port}`);
  }

  return {
    plugins: [
      react(),
      zipPack()
    ],
    server: {
      port,
      strictPort: false,
      proxy: {
        // API 代理示例（按项目需求修改）
        // "/api": {
        //   target: "http://localhost:3000",
        //   changeOrigin: true,
        //   rewrite: (path) => path.replace(/^\/api/, "")
        // }
      }
    },
    build: {
      outDir: "dist",
      sourcemap: false
    }
  };
});
