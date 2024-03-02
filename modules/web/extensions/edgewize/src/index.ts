import routes from './routes';
import locales from './locales';

const menu = {
  parent: 'global',
  name: 'v2/edgewize',
  title: 'edgewize-io',
  icon: 'cluster',
  order: 0,
  desc: 'EDGEWIZE_COMPUTING',
  ksModule: 'openpitrix',
  authKey: 'manage-app',
  authAction: 'manage',
};

const workspaceAppManageMenu = {
  parent: 'workspace',
  name: 'edgesetting',
  title: 'EDGEWIZE_SETTING',
  icon: 'appcenter',
  order: 3,
  desc: 'EDGEWIZE_PROJECT_SETTING',
  skipAuth: true,
  children: [
    {
      name: 'edgesetting',
      title: 'EDGEWIZE_LABELS_SETTING',
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

export default extensionConfig;
