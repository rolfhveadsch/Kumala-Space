const { getDriveClient, getDriveClientForUserToken, extractAuthHeaderFromEvent, FOLDER_IDS, handleOptions, verifyGoogleToken, jsonResponse } = require('./_drive.cjs');

exports.handler = async (event) => {
    const options = handleOptions(event);
    if (options) return options;

    // Auth check - prefer user token, fallback to service account
    const authHeader = extractAuthHeaderFromEvent(event);
    const user = authHeader ? await verifyGoogleToken(authHeader) : null;
    if (!user) console.log('[list-notes] No valid user token, falling back to service account if available');

    try {
        const drive = user && user.token ? getDriveClientForUserToken(user.token) : await getDriveClient();
        const q = FOLDER_IDS.notes ? `'${FOLDER_IDS.notes}' in parents and trashed=false and mimeType='application/json'` : "mimeType='application/json' and trashed=false";
        const response = await drive.files.list({
            q,
            fields: 'files(id, name, modifiedTime, createdTime, description)',
            orderBy: 'modifiedTime desc',
            pageSize: 100,
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
        });

        return jsonResponse(200, response.data.files || []);
    } catch (err) {
        console.error('List notes error:', err);
        return jsonResponse(500, { error: err.message });
    }
};
