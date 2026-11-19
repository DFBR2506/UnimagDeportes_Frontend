import path from 'node:path'
import { createServer } from 'vite'

/** Cada caso tiene módulos, entorno y almacenamiento independientes. */
export async function client(t, demo, initial = {}) {
  const originals = {
    fetch: Object.getOwnPropertyDescriptor(globalThis, 'fetch'),
    localStorage: Object.getOwnPropertyDescriptor(globalThis, 'localStorage'),
  }
  const storage = new Map(Object.entries(initial))
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
  })
  const server = await createServer({
    configFile: false,
    envDir: false,
    logLevel: 'error',
    resolve: { alias: { '@': path.resolve('src') } },
    define: {
      'import.meta.env.VITE_DEMO_LOGIN': demo === undefined ? 'undefined' : JSON.stringify(demo),
      'import.meta.env.VITE_API_URL': '"/api"',
    },
    server: { middlewareMode: true, ws: false, watch: null },
    optimizeDeps: { noDiscovery: true },
  })
  t.after(async () => {
    await server.close()
    for (const [key, descriptor] of Object.entries(originals)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor)
      else delete globalThis[key]
    }
  })
  return {
    storage,
    load: (file) => server.ssrLoadModule(`/src/${file}`),
  }
}

export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
