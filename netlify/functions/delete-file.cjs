const { getDriveClient, getDriveClientForUserToken, extractAuthHeaderFromEvent, handleOptions, verifyGoogleToken, jsonResponse } = require('./_drive.cjs');

exports.handler = async (event) => {
    const options = handleOptions(event);
    if (options) return options;

    // Auth check - prefer user token, fallback to service account
    const authHeader = extractAuthHeaderFromEvent(event);
    const user = authHeader ? await verifyGoogleToken(authHeader) : null;
    if (!user) console.log('[delete-file] No valid user token, falling back to service account if available');

    try {
        const { fileId } = JSON.parse(event.body);
        if (!fileId) return jsonResponse(400, { error: 'fileId is required' });

        const drive = user && user.token ? getDriveClientForUserToken(user.token) : await getDriveClient();
        await drive.files.delete({ fileId, supportsAllDrives: true });

        return jsonResponse(200, { success: true });
    } catch (err) {
        console.error('Delete error:', err);
        return jsonResponse(500, { error: err.message });
    }
};
