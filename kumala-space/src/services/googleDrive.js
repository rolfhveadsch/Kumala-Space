const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const FOLDER_NAME = "Kumala's Space";
const PHOTOS_FOLDER = 'Photos';
const NOTES_FOLDER = 'Notes';

let gapiLoaded = false;
let tokenClient = null;

// ─── Init ────────────────────────────────────────────────
export const initGapi = () =>
  new Promise((resolve) => {
    if (gapiLoaded) return resolve();
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      window.gapi.load('client', async () => {
        await window.gapi.client.init({
          apiKey: '',
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });
        gapiLoaded = true;
        resolve();
      });
    };
    document.body.appendChild(script);
  });

export const initTokenClient = (onTokenReceived) =>
  new Promise((resolve) => {
    const gisScript = document.createElement('script');
    gisScript.src = 'https://accounts.google.com/gsi/client';
    gisScript.onload = () => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse) => {
          if (tokenResponse.error) return;
          onTokenReceived(tokenResponse.access_token);
        },
      });
      resolve(tokenClient);
    };
    document.body.appendChild(gisScript);
  });

export const requestToken = () => {
  if (tokenClient) tokenClient.requestAccessToken({ prompt: '' });
};

export const revokeToken = (token) => {
  window.google.accounts.oauth2.revoke(token);
};

// ─── Folder helpers ──────────────────────────────────────
const findOrCreateFolder = async (name, parentId = null) => {
  const q = parentId
    ? `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`
    : `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

  const res = await window.gapi.client.drive.files.list({ q, fields: 'files(id,name)' });
  if (res.result.files.length > 0) return res.result.files[0].id;

  const created = await window.gapi.client.drive.files.create({
    resource: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : [],
    },
    fields: 'id',
  });
  return created.result.id;
};

const getRootFolder = async () => findOrCreateFolder(FOLDER_NAME);

const getPhotosFolder = async () => {
  const root = await getRootFolder();
  return findOrCreateFolder(PHOTOS_FOLDER, root);
};

const getNotesFolder = async () => {
  const root = await getRootFolder();
  return findOrCreateFolder(NOTES_FOLDER, root);
};

// ─── Photos ──────────────────────────────────────────────
export const uploadPhoto = async (file, onProgress) => {
  const folderId = await getPhotosFolder();
  const token = window.gapi.client.getToken().access_token;

  const metadata = { name: file.name, parents: [folderId] };
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,thumbnailLink,webContentLink');
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status === 200) resolve(JSON.parse(xhr.responseText));
      else reject(new Error(xhr.responseText));
    };
    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(form);
  });
};

export const listPhotos = async () => {
  const folderId = await getPhotosFolder();
  const res = await window.gapi.client.drive.files.list({
    q: `'${folderId}' in parents and trashed=false and mimeType contains 'image/'`,
    fields: 'files(id,name,thumbnailLink,createdTime,size)',
    orderBy: 'createdTime desc',
  });
  return res.result.files;
};

export const getPhotoUrl = (fileId) => {
  const token = window.gapi.client.getToken().access_token;
  return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&access_token=${token}`;
};

export const deleteFile = async (fileId) => {
  await window.gapi.client.drive.files.delete({ fileId });
};

// ─── Notes ───────────────────────────────────────────────
export const saveNote = async (note) => {
  // note = { id?, title, content, updatedAt }
  const folderId = await getNotesFolder();
  const token = window.gapi.client.getToken().access_token;
  const body = JSON.stringify(note);
  const blob = new Blob([body], { type: 'application/json' });

  if (note.id) {
    // Update existing
    const xhr = new XMLHttpRequest();
    xhr.open('PATCH', `https://www.googleapis.com/upload/drive/v3/files/${note.id}?uploadType=media`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    return new Promise((resolve, reject) => {
      xhr.onload = () => resolve(JSON.parse(xhr.responseText));
      xhr.onerror = () => reject(new Error('Update failed'));
      xhr.send(blob);
    });
  } else {
    // Create new
    const metadata = {
      name: `${note.title || 'Untitled'}.json`,
      parents: [folderId],
      mimeType: 'application/json',
    };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,createdTime,modifiedTime');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.onload = () => {
        if (xhr.status === 200) resolve(JSON.parse(xhr.responseText));
        else reject(new Error(xhr.responseText));
      };
      xhr.onerror = () => reject(new Error('Create failed'));
      xhr.send(form);
    });
  }
};

export const listNotes = async () => {
  const folderId = await getNotesFolder();
  const res = await window.gapi.client.drive.files.list({
    q: `'${folderId}' in parents and trashed=false and mimeType='application/json'`,
    fields: 'files(id,name,modifiedTime,createdTime)',
    orderBy: 'modifiedTime desc',
  });
  return res.result.files;
};

export const getNote = async (fileId) => {
  const token = window.gapi.client.getToken().access_token;
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.json();
};

export const renameNote = async (fileId, newTitle) => {
  await window.gapi.client.drive.files.update({
    fileId,
    resource: { name: `${newTitle}.json` },
  });
};
