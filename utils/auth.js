import crypto from 'crypto';

const AuthScheme = 'Basic ';

const getAuthorizationHeader = (req) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith(AuthScheme)) {
    return null;
  }
  return Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString();
};

const extractCredentials = (decodedAuthHeader) => {
  let email = '';
  let password = null;
  for (let i = 0; i < decodedAuthHeader.length; i += 1) {
    if (decodedAuthHeader[i] === ':' && i + 1 < decodedAuthHeader.length) {
      password = decodedAuthHeader.substring(i + 1);
      break;
    }
    email += decodedAuthHeader[i];
  }
  return [email, password];
};

const sha1Hash = (password) => {
  const sha1 = crypto.createHash('sha1');
  sha1.update(password, 'utf-8');
  return sha1.digest('hex');
};

module.exports = { getAuthorizationHeader, extractCredentials, sha1Hash };
