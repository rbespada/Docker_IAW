const path = require('path');

module.exports = {
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'),
    },
    apiToken: {
      salt: env('API_TOKEN_SALT', 'testSalt'),
    },
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'testSalt'),
    },
  },
  flags: {
    nps: env.bool('FLAGS_NPS', true),
    promoteEE: env.bool('FLAGS_PROMOTE_EE', true),
  },
};
