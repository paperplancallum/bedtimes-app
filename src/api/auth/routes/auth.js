'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/auth/send-code',
      handler: 'auth.sendCode',
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/auth/verify-code',
      handler: 'auth.verifyCode',
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/auth/subscription',
      handler: 'auth.getSubscription',
      config: {
        auth: false,
        policies: [],
      },
    },
  ],
};