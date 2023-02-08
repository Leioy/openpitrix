import routes from './routes';
import locales from './locales';

const menu = {
  parent: 'topbar',
  name: 'app-store',
  link: '/apps',
  title: 'APP_STORE',
  icon: 'appcenter',
  order: 2,
  desc: 'App Store!',
  skipAuth: true,
};

const extensionConfig = {
  routes,
  menus: [menu],
  locales,
};

globals.context.registerExtension(extensionConfig);
