import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { createServer as createViteServer } from 'vite';

// Safely derive __dirname for both ESM (tsx) and CJS (esbuild bundle)
const getDirname = () => {
  if (typeof __dirname !== 'undefined') {
    return __dirname;
  }
  if (typeof import.meta !== 'undefined' && import.meta.url) {
    return path.dirname(fileURLToPath(import.meta.url));
  }
  return process.cwd();
};

const currentDir = getDirname();

// Support both ESM (via tsx in dev) and bundled CJS (via esbuild in prod)
const nodeRequire =
  typeof require === 'function'
    ? require
    : createRequire(import.meta.url);

function resolveBackendModule(relativeSubpath: string) {
  const possiblePaths = [
    path.resolve(process.cwd(), relativeSubpath),
    path.resolve(currentDir, '..', relativeSubpath),
    path.resolve(currentDir, relativeSubpath),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return nodeRequire(p);
    }
  }
  return nodeRequire(path.resolve(process.cwd(), relativeSubpath));
}

const backendApp = resolveBackendModule('e-kavach-backend/src/app.js');
const socketService = resolveBackendModule('e-kavach-backend/src/services/socket.service.js');

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Trust Cloudflare Tunnel and reverse proxies for IP detection & secure cookies
  app.set('trust proxy', true);

  // Global CORS and security headers for cross-device access (local LAN, mobile, cloudflared, Cloud Run)
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Vary', 'Origin');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, X-Emergency-Bypass, X-Bypass-Reason, CF-Connecting-IP'
    );
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // Delegate Socket.IO HTTP polling transport requests before any other middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.url.startsWith('/ws/telemetry') || req.url.startsWith('/socket.io')) {
      if (socketService.io && socketService.io.engine) {
        return (socketService.io.engine as any).handleRequest(req, res);
      }
    }
    next();
  });

  // Instant Cloud Run & container health probe endpoint
  app.get(['/health', '/api/health', '/healthz', '/livez'], (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'ekawach-integrated',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // Mount backend API routes, Prometheus /metrics, and static uploads first
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (
      req.url.startsWith('/api') ||
      req.url.startsWith('/uploads') ||
      req.url === '/metrics' ||
      req.url.startsWith('/metrics')
    ) {
      return backendApp(req, res, next);
    }
    next();
  });

  // Create shared HTTP server for Express and Socket.IO
  const server = http.createServer(app);

  // Initialize Socket.io telemetry service on the shared server
  try {
    socketService.init(server);
    console.log('✅ Real-time telemetry WebSocket service attached to HTTP server');
  } catch (err: any) {
    console.warn('⚠️ Socket service initialization warning:', err.message);
  }

  // Frontend integration: Vite middleware in dev OR pre-bundled static files in prod
  const possibleDistPaths = [
    path.resolve(process.cwd(), 'dist'),
    path.resolve(currentDir, 'dist'),
    path.resolve(currentDir),
  ];
  const distPath = possibleDistPaths.find((p) => fs.existsSync(path.join(p, 'index.html')));
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.SERVE_STATIC === 'true' ||
    (process.env.NODE_ENV !== 'development' && !!distPath);

  if (!isProduction) {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
        allowedHosts: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('✅ Vite middleware mounted serving root E-KAWACH frontend (allowedHosts: true)');
  } else {
    const staticDir = distPath || path.resolve(process.cwd(), 'dist');
    app.use(express.static(staticDir, { maxAge: '1h', etag: true }));
    app.get('*', (req: Request, res: Response) => {
      const indexPath = path.join(staticDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send('<h1>E-KAVACH Production Server Active</h1>');
      }
    });
    console.log(`✅ Production static server mounted serving: ${staticDir}`);
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 E-KAVACH integrated fullstack server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
