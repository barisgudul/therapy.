import localConfig from './app.config.local.js'; // API key burada tanımlı

export default {
  expo: {
    name: 'TherapyApp',
    slug: 'TherapyApp',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'therapyapp',

    extra: {
      ...localConfig.extra, // API key buradan geliyor
    },
  },
};
