import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const PUBLIC_SITEMAP_PATHS = ['/', '/how-to-play', '/create-room', '/join-room'] as const

function seoBuildPlugin(siteUrl: string) {
  return {
    name: 'seo-build',
    closeBundle() {
      if (!siteUrl) return

      const base = siteUrl.replace(/\/$/, '')
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PUBLIC_SITEMAP_PATHS.map(
  (path) => `  <url>
    <loc>${base}${path === '/' ? '' : path}</loc>
    <changefreq>${path === '/' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${path === '/' ? '1.0' : path === '/how-to-play' ? '0.9' : '0.8'}</priority>
  </url>`
).join('\n')}
</urlset>
`

      const robots = `User-agent: *
Allow: /
Allow: /how-to-play
Allow: /create-room
Allow: /join-room
Disallow: /room-waiting
Disallow: /room
Disallow: /game

Sitemap: ${base}/sitemap.xml
`

      const outDir = resolve(__dirname, 'dist')
      writeFileSync(resolve(outDir, 'sitemap.xml'), sitemap, 'utf8')
      writeFileSync(resolve(outDir, 'robots.txt'), robots, 'utf8')
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = env.VITE_SITE_URL ?? ''

  return {
    plugins: [react(), tailwindcss(), seoBuildPlugin(siteUrl)],
  }
})
