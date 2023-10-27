import routes from './routes';
import locales from './locales';

const menu = {
  parent: 'topbar',
  name: 'apps-manage',
  title: 'APP_STORE_MANAGEMENT',
  icon: 'openpitrix',
  order: 2,
  desc: 'APP_STORE_MANAGEMENT_DESC',
  skipAuth: true,
};

const workspaceAppManageMenu = {
  parent: 'workspace',
  name: 'apps',
  title: 'APPS_MANAGEMENT',
  icon: 'appcenter',
  order: 3,
  desc: 'APP_STORE_MANAGEMENT_DESC',
  skipAuth: true,
  children: [
    {
      name: 'apps',
      title: 'APP_TEMPLATE_PL',
      icon: 'appcenter',
      skipAuth: true,
    },
  ],
};

const extensionConfig = {
  routes,
  menus: [menu, workspaceAppManageMenu],
  locales,
};

globals.context.registerExtension(extensionConfig);
