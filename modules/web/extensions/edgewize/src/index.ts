import routes from './routes';
import locales from './locales';

const menu = {
  parent: 'global',
  name: 'v2/edgewize',
  title: 'edgewize-io',
  icon: 'cluster',
  order: 0,
  desc: '边缘计算',
  skipAuth: true,
};

const workspaceAppManageMenu = {
  parent: 'workspace',
  name: 'edgesetting',
  title: '边缘设置',
  icon: 'appcenter',
  order: 3,
  desc: '边缘项目设置',
  skipAuth: true,
  children: [
    {
      name: 'edgewize/bind-labels',
      title: '设置边缘标签',
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
