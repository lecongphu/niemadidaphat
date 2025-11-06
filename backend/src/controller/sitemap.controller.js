import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import { Teacher } from "../models/teacher.model.js";

export const generateSitemap = async (req, res, next) => {
	try {
		const baseUrl = process.env.FRONTEND_URL || "https://niemadidaphat.com";

		// Fetch all data
		const [songs, albums, teachers] = await Promise.all([
			Song.find().select("_id updatedAt").lean(),
			Album.find().select("_id updatedAt").lean(),
			Teacher.find().select("_id updatedAt").lean(),
		]);

		// Build sitemap XML
		let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
		xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

		// Homepage
		xml += "  <url>\n";
		xml += `    <loc>${baseUrl}/</loc>\n`;
		xml += "    <changefreq>daily</changefreq>\n";
		xml += "    <priority>1.0</priority>\n";
		xml += "  </url>\n";

		// Songs
		songs.forEach((song) => {
			xml += "  <url>\n";
			xml += `    <loc>${baseUrl}/songs/${song._id}</loc>\n`;
			xml += `    <lastmod>${new Date(song.updatedAt).toISOString()}</lastmod>\n`;
			xml += "    <changefreq>weekly</changefreq>\n";
			xml += "    <priority>0.8</priority>\n";
			xml += "  </url>\n";
		});

		// Albums
		albums.forEach((album) => {
			xml += "  <url>\n";
			xml += `    <loc>${baseUrl}/albums/${album._id}</loc>\n`;
			xml += `    <lastmod>${new Date(album.updatedAt).toISOString()}</lastmod>\n`;
			xml += "    <changefreq>weekly</changefreq>\n";
			xml += "    <priority>0.8</priority>\n";
			xml += "  </url>\n";
		});

		// Static pages
		const staticPages = [
			{ url: "/privacy-policy", priority: "0.5" },
			{ url: "/terms-of-service", priority: "0.5" },
			{ url: "/chat", priority: "0.6" },
		];

		staticPages.forEach((page) => {
			xml += "  <url>\n";
			xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
			xml += "    <changefreq>monthly</changefreq>\n";
			xml += `    <priority>${page.priority}</priority>\n`;
			xml += "  </url>\n";
		});

		xml += "</urlset>";

		// Set proper headers for XML
		res.header("Content-Type", "application/xml");
		res.send(xml);
	} catch (error) {
		console.log("Error generating sitemap:", error);
		next(error);
	}
};
