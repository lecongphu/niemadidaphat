import cloudinary from "./cloudinary.js";

/**
 * Extract public_id from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} - Public ID or null if extraction fails
 */
export const extractPublicId = (url) => {
	if (!url || typeof url !== 'string') return null;

	try {
		// Decode URL-encoded characters (like %20, %E1%BB%8Bnh, etc.)
		const decodedUrl = decodeURIComponent(url);

		const parts = decodedUrl.split('/');
		const uploadIndex = parts.indexOf('upload');

		if (uploadIndex !== -1 && uploadIndex + 2 < parts.length) {
			// Get everything after 'upload/v{version}/'
			const pathAfterUpload = parts.slice(uploadIndex + 2).join('/');
			// Remove file extension
			const lastDotIndex = pathAfterUpload.lastIndexOf('.');
			const publicId = lastDotIndex !== -1
				? pathAfterUpload.substring(0, lastDotIndex)
				: pathAfterUpload;

			return publicId || null;
		}

		return null;
	} catch (error) {
		console.error('Error extracting public_id:', error);
		return null;
	}
};

/**
 * Delete a file from Cloudinary
 * @param {string} url - Cloudinary URL
 * @param {string} resourceType - 'image', 'video', 'raw', or 'auto'
 * @returns {Promise<{success: boolean, result: any}>}
 */
export const deleteFromCloudinary = async (url, resourceType = 'image') => {
	if (!url) {
		return { success: false, result: null, error: 'No URL provided' };
	}

	const publicId = extractPublicId(url);

	if (!publicId) {
		console.log('✗ Could not extract public_id from URL:', url);
		return { success: false, result: null, error: 'Could not extract public_id' };
	}

	try {
		console.log(`\n🗑️  Attempting to delete ${resourceType} from Cloudinary...`);
		console.log('URL:', url);
		console.log('Extracted public_id:', publicId);

		// Try to delete with the decoded public_id
		let result = await cloudinary.uploader.destroy(publicId, {
			resource_type: resourceType,
			invalidate: true // Invalidate CDN cache
		});

		console.log('Deletion result:', result);

		// If deletion failed with 'not found', try alternative approaches
		if (result.result === 'not found') {
			console.log('⚠️  File not found, trying alternative deletion methods...');

			// Try 1: Use the original URL path directly (encoded version)
			try {
				const urlObj = new URL(url);
				const pathname = urlObj.pathname;
				const uploadIndex = pathname.indexOf('/upload/');
				if (uploadIndex !== -1) {
					// Extract path after /upload/v{version}/
					const afterUpload = pathname.substring(uploadIndex + 8); // '/upload/' = 8 chars
					const versionEndIndex = afterUpload.indexOf('/');
					if (versionEndIndex !== -1) {
						const publicIdFromPath = afterUpload.substring(versionEndIndex + 1);
						// Remove extension
						const lastDot = publicIdFromPath.lastIndexOf('.');
						const encodedPublicId = lastDot !== -1
							? publicIdFromPath.substring(0, lastDot)
							: publicIdFromPath;

						console.log('Trying with encoded public_id:', encodedPublicId);
						result = await cloudinary.uploader.destroy(encodedPublicId, {
							resource_type: resourceType,
							invalidate: true
						});
						console.log('Second attempt result:', result);
					}
				}
			} catch (err) {
				console.log('Alternative method error:', err.message);
			}
		}

		if (result.result === 'ok') {
			console.log(`✅ ${resourceType} deleted from Cloudinary successfully!`);
			return { success: true, result };
		} else if (result.result === 'not found') {
			console.log(`⚠️  ${resourceType} not found on Cloudinary (may already be deleted)`);
			return { success: false, result, error: 'File not found' };
		} else {
			console.log(`❌ ${resourceType} deletion failed:`, result);
			return { success: false, result, error: result.result };
		}
	} catch (error) {
		console.log(`❌ Error deleting ${resourceType} from Cloudinary:`, error.message);
		console.log('Error details:', error);
		return { success: false, result: null, error: error.message };
	}
};

/**
 * Delete multiple files from Cloudinary
 * @param {Array<{url: string, resourceType: string}>} files - Array of files to delete
 * @returns {Promise<Array<{url: string, success: boolean, result: any}>>}
 */
export const deleteMultipleFromCloudinary = async (files) => {
	const results = await Promise.allSettled(
		files.map(({ url, resourceType }) =>
			deleteFromCloudinary(url, resourceType).then(result => ({ url, ...result }))
		)
	);

	return results.map((result, index) => {
		if (result.status === 'fulfilled') {
			return result.value;
		} else {
			return {
				url: files[index].url,
				success: false,
				error: result.reason?.message || 'Unknown error'
			};
		}
	});
};

/**
 * Upload a file to Cloudinary
 * @param {Object} file - File object from express-fileupload
 * @param {Object} options - Cloudinary upload options
 * @returns {Promise<string>} - Secure URL of uploaded file
 */
export const uploadToCloudinary = async (file, options = {}) => {
	try {
		const result = await cloudinary.uploader.upload(file.tempFilePath, {
			resource_type: "auto",
			...options,
		});

		console.log("Upload successful:", result.secure_url);
		return result.secure_url;
	} catch (error) {
		console.error("Error in uploadToCloudinary:", error);
		console.error("Error message:", error.message);
		throw new Error(`Error uploading to cloudinary: ${error.message}`);
	}
};
