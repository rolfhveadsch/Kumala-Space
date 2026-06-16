const { getDriveClient, getDriveClientForUserToken, extractAuthHeaderFromEvent, handleOptions, verifyGoogleToken, jsonResponse, CORS_HEADERS } = require('./_drive.cjs');

exports.handler = async (event) => {
    const options = handleOptions(event);
    if (options) return options;

    // Auth check - prefer user token, fallback to service account
    const authHeader = extractAuthHeaderFromEvent(event);
    const user = authHeader ? await verifyGoogleToken(authHeader) : null;
    if (!user) console.log('[get-file] No valid user token, falling back to service account if available');

    try {
        const fileId = event.queryStringParameters?.fileId;
        if (!fileId) return jsonResponse(400, { error: 'fileId query param is required' });

        const drive = user && user.token ? getDriveClientForUserToken(user.token) : await getDriveClient();

        // Get file metadata to determine mimeType
        const metaRes = await drive.files.get({
            fileId,
            fields: 'id, name, mimeType, size',
            supportsAllDrives: true,
        });
        const { mimeType, name } = metaRes.data;

        // Get file content
        const contentRes = await drive.files.get(
            { fileId, alt: 'media', supportsAllDrives: true },
            { responseType: 'arraybuffer' }
        );

        const buffer = Buffer.from(contentRes.data);

        return {
            statusCode: 200,
            headers: {
                ...CORS_HEADERS,
                'Content-Type': mimeType || 'application/octet-stream',
                'Content-Disposition': `inline; filename="${name}"`,
                'Cache-Control': 'public, max-age=3600',
            },
            body: buffer.toString('base64'),
            isBase64Encoded: true,
        };
    } catch (err) {
        console.error('Get file error:', err);
        return jsonResponse(500, { error: err.message });
    }
};
