import routes from './routes';
import locales from './locales';

const menu = {
  parent: 'global',
  name: 'v2/edgewize',
  title: 'edgewize-io',
  icon: 'cluster',
  order: 0,
  desc: 'EDGEWIZE_COMPUTING',
  ksModule: 'edgewize',
  authKey: 'global-edge-cluster-management',
  authAction: 'manage',
};

const workspaceAppManageMenu = {
  parent: 'workspace',
  name: 'edge-management',
  title: 'EDGEWIZE_MANAGEMENT',
  icon: 'appcenter',
  order: 3,
  desc: 'EDGEWIZE_PROJECT_SETTING',
  children: [
    {
      name: 'edge-templates',
      title: 'EDGEWIZE_TEMPLATE',
      icon: 'appcenter',
      order: 0,
      authKey: 'edge-app-templates',
    },
    {
      name: 'edge-setting',
      title: 'EDGEWIZE_LABELS',
      icon: 'appcenter',
      authKey: 'edge-workspaces',
    },
  ],
};

const extensionConfig = {
  routes,
  menus: [menu, workspaceAppManageMenu],
  locales,
  isCheckLicense: true,
};

export default extensionConfig;
