import routes from './routes';
import locales from './locales';

const menu = {
  parent: 'global',
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
      name: 'store',
      title: 'APP_TEMPLATE_PL',
      icon: 'appcenter',
      skipAuth: true,
    },
    {
      name: 'repo',
      title: '应用仓库',
      icon: 'appcenter',
      skipAuth: true,
    },
  ],
};

const clusterAppManageMenu = {
  parent: 'project',
  name: 'apps',
  title: 'APPS_MANAGEMENT',
  icon: 'appcenter',
  order: 4,
  desc: 'APP_STORE_MANAGEMENT_DESC',
  skipAuth: true,
  children: [
    {
      name: 'deploy',
      title: '应用部署管理',
      icon: 'appcenter',
      skipAuth: true,
    },
  ],
};

const extensionConfig = {
  routes,
  menus: [menu, workspaceAppManageMenu, clusterAppManageMenu],
  locales,
};

globals.context.registerExtension(extensionConfig);
