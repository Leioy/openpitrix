import React from 'react';
import Layout from '../components/Base/ListLayout';
import BindLabels from '../containers/BindLabels';

const PATH = '/workspaces/:workspace/edgewize';

export default [
  {
    path: PATH,
    element: <Layout />,
    children: [
      {
        path: 'bind-labels',
        element: <BindLabels />,
      },
    ],
  },
];
