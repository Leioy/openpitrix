import React from 'react';

import AppDeploy from '../containers/AppDeploy';
import AppDetails from '../containers/AppDetails';
import BaseLayout from '../containers/BaseLayout';
import AppsDashBoard from '../containers/AppsDashBoard';

const PATH = '/apps';

export default [
  {
    path: PATH,
    element: <BaseLayout />,
    children: [
      { index: true, element: <AppsDashBoard /> },
      { path: `${PATH}/:appId`, element: <AppDetails /> },
      { path: `${PATH}/:appId/deploy`, element: <AppDeploy /> },
    ],
  },
];
