import React from 'react';
import Layout from '../components/Base/ListLayout';
import BindLabels from '../containers/BindLabels';

const PATH = '/workspaces/:workspace/edgesetting';

export default [
  {
    path: PATH,
    element: <Layout />,
    children: [
      {
        index: true,
        element: <BindLabels />,
      },
    ],
  },
];
