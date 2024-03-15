import routes from './routes';
import locales from './locales';

const menu = {
  parent: 'global',
  name: 'apps-manage',
  title: 'APP_STORE_MANAGEMENT',
  icon: 'openpitrix',
  order: 2,
  desc: 'APP_STORE_MANAGEMENT_DESC',
  ksModule: 'openpitrix',
  authKey: 'manage-app',
  authAction: 'manage',
};

const workspaceAppManage = {
  parent: 'workspace.apps',
  name: 'app-templates',
  title: 'APP_TEMPLATE_PL',
  icon: 'appcenter',
  order: 0,
  authKey: 'app-templates',
};

const extensionConfig = {
  routes,
  menus: [menu, workspaceAppManage],
  locales,
  sCheckLicense: true,
};

export default extensionConfig;
