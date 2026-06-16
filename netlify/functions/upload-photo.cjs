const { getDriveClient, getDriveClientForUserToken, extractAuthHeaderFromEvent, FOLDER_IDS, makePublic, handleOptions, verifyGoogleToken, jsonResponse } = require('./_drive.cjs');
const { Readable } = require('stream');

exports.handler = async (event) => {
    const options = handleOptions(event);
    if (options) return options;

    // Auth check - prefer user token, but fall back to service account if no valid user token
    const authHeader = extractAuthHeaderFromEvent(event);
    const user = authHeader ? await verifyGoogleToken(authHeader) : null;
    if (!user) {
        console.log('[upload-photo] User auth failed or token missing');
        return jsonResponse(401, { error: 'Unauthorized: Harap login ulang, sesi Google lu udah habis bre.' });
    }

    try {
        const { fileName, mimeType, description, fileBase64 } = JSON.parse(event.body);

        const drive = getDriveClientForUserToken(user.token);
        const fileBuffer = Buffer.from(fileBase64, 'base64');

        const response = await drive.files.create({
            requestBody: {
                name: fileName,
                description: description || '',
                parents: FOLDER_IDS.photos ? [FOLDER_IDS.photos] : undefined,
            },
            media: {
                mimeType,
                body: Readable.from(fileBuffer),
            },
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
            fields: 'id, name, description, createdTime, thumbnailLink',
        });

        // Make the file publicly readable (anyone with link can view)
        await makePublic(drive, response.data.id);

        return jsonResponse(200, response.data);
    } catch (err) {
        console.error('Upload photo error:', err);
        return jsonResponse(500, { error: err.message });
    }
};
