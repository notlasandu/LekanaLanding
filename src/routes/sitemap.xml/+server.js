/** @type {import('./$types').RequestHandler} */
export async function GET() {
    const baseUrl = 'https://lekana.dev';

    // Define all public pages (excluding admin routes)
    const pages = [
        {
            url: '/',
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: 1.0
        },
        {
            url: '/privacy',
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: 0.5
        },
        {
            url: '/terms',
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: 0.5
        }
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
            .map(
                (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
            )
            .join('\n')}
</urlset>`;

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'max-age=0, s-maxage=3600'
        }
    });
}
