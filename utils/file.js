import fs from 'fs';

const createParentFolders = (path) => {
  if (!path) return;
  const parentFolders = path.split('/').slice(0, -1).join('/');
  if (parentFolders) {
    fs.mkdirSync(parentFolders, { recursive: true });
  }
};

export default createParentFolders;
