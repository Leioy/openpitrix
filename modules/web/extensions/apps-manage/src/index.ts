import routes from './routes';
import locales from './locales';

const menu = {
  parent: 'global',
  name: 'manage-app',
  title: 'APP_STORE_MANAGEMENT',
  icon: 'openpitrix',
  order: 2,
  desc: 'APP_STORE_MANAGEMENT_DESC',
  ksModule: 'openpitrix',
  authKey: 'manage-app',
  authAction: 'manage',
};

const extensionConfig = {
  routes,
  menus: [menu],
  locales,
};

globals.context.registerExtension(extensionConfig);
