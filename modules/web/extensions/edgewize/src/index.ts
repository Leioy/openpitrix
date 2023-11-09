// import routes from './routes';
// import locales from './locales';

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
      name: 'bind-edgewize',
      title: '绑定边缘集群',
      icon: 'appcenter',
      skipAuth: true,
    },
    {
      name: 'bind-project',
      title: '边缘项目',
      icon: 'appcenter',
      skipAuth: true,
    },
  ],
};
const extensionConfig = {
  // routes,
  menus: [menu, workspaceAppManageMenu],
  // locales,
};

globals.context.registerExtension(extensionConfig);
