const { getDriveClient, getDriveClientForUserToken, extractAuthHeaderFromEvent, FOLDER_IDS, handleOptions, verifyGoogleToken, jsonResponse } = require('./_drive.cjs');
const { Readable } = require('stream');

exports.handler = async (event) => {
    const options = handleOptions(event);
    if (options) return options;

    // Auth check - prefer user token, fallback to service account
    const authHeader = extractAuthHeaderFromEvent(event);
    const user = authHeader ? await verifyGoogleToken(authHeader) : null;
    if (!user) console.log('[upload-note] No valid user token, falling back to service account if available');

    try {
        const note = JSON.parse(event.body);
        const drive = user && user.token ? getDriveClientForUserToken(user.token) : await getDriveClient();

        const content = JSON.stringify({
            title: note.title,
            content: note.content,
            updatedAt: note.updatedAt,
        });

        const snippet = (note.content || '')
            .replace(/<[^>]*>?/gm, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 150);

        // UPDATE existing note
        if (note.id) {
            await drive.files.update({
                fileId: note.id,
                requestBody: {
                    name: `${note.title || 'Untitled'}.json`,
                    description: snippet,
                },
                media: {
                    mimeType: 'application/json',
                    body: Readable.from(Buffer.from(content)),
                },
                supportsAllDrives: true,
                includeItemsFromAllDrives: true,
                fields: 'id, name, modifiedTime',
            });
            return jsonResponse(200, { id: note.id });
        }

        // CREATE new note
        const response = await drive.files.create({
            requestBody: {
                name: `${note.title || 'Untitled'}.json`,
                description: snippet,
                parents: FOLDER_IDS.notes ? [FOLDER_IDS.notes] : undefined,
                mimeType: 'application/json',
            },
            media: {
                mimeType: 'application/json',
                body: Readable.from(Buffer.from(content)),
            },
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
            fields: 'id, name, createdTime, modifiedTime, description',
        });

        return jsonResponse(200, response.data);
    } catch (err) {
        console.error('Upload note error:', err);
        return jsonResponse(500, { error: err.message });
    }
};
