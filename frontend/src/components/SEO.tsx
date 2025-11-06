interface SEOProps {
	title: string;
	description: string;
	type?: "website" | "article" | "music.song" | "music.album";
	image?: string;
	url?: string;
	keywords?: string[];
	author?: string;
	publishedTime?: string;
	modifiedTime?: string;
}

const SEO = ({
	title,
	description,
	type = "website",
	image,
	url,
	keywords = [],
	author,
	publishedTime,
	modifiedTime,
}: SEOProps) => {
	const siteName = "Niệm A Di Đà Phật";
	const defaultImage = "/og-image.png";
	const siteUrl = window.location.origin;
	const fullUrl = url ? `${siteUrl}${url}` : window.location.href;
	const fullImage = image ? (image.startsWith("http") ? image : `${siteUrl}${image}`) : `${siteUrl}${defaultImage}`;

	// Full title with site name
	const fullTitle = `${title} | ${siteName}`;

	// Default keywords
	const defaultKeywords = [
		"niệm phật",
		"a di đà phật",
		"phật pháp",
		"kinh phật",
		"thiền học",
		"tu hành",
		"niệm a di đà phật",
	];

	const allKeywords = [...new Set([...keywords, ...defaultKeywords])];

	return (
		<>
			{/* Primary Meta Tags */}
			<title>{fullTitle}</title>
			<meta name="title" content={fullTitle} />
			<meta name="description" content={description} />
			<meta name="keywords" content={allKeywords.join(", ")} />
			{author && <meta name="author" content={author} />}

			{/* Open Graph / Facebook */}
			<meta property="og:type" content={type} />
			<meta property="og:url" content={fullUrl} />
			<meta property="og:title" content={fullTitle} />
			<meta property="og:description" content={description} />
			<meta property="og:image" content={fullImage} />
			<meta property="og:site_name" content={siteName} />
			{publishedTime && <meta property="article:published_time" content={publishedTime} />}
			{modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

			{/* Twitter */}
			<meta property="twitter:card" content="summary_large_image" />
			<meta property="twitter:url" content={fullUrl} />
			<meta property="twitter:title" content={fullTitle} />
			<meta property="twitter:description" content={description} />
			<meta property="twitter:image" content={fullImage} />

			{/* Additional SEO tags */}
			<link rel="canonical" href={fullUrl} />
			<meta name="robots" content="index, follow" />
			<meta name="googlebot" content="index, follow" />
			<meta httpEquiv="Content-Language" content="vi" />
			<meta name="language" content="Vietnamese" />

			{/* Music specific tags for songs and albums */}
			{type === "music.song" && (
				<>
					<meta property="music:duration" content="0" />
					<meta property="music:musician" content={author || ""} />
				</>
			)}

			{type === "music.album" && author && (
				<>
					<meta property="music:musician" content={author} />
				</>
			)}
		</>
	);
};

export default SEO;
