import React from 'react';
import { Navigate } from 'react-router-dom';
import { AppInformation, InstanceList, AuditRecords } from '@ks-console/shared';
import VersionList from './VersionList';
import AppDetailPage from './index';

export default function (PATH: string) {
  return [
    {
      path: `${PATH}/:appName`,
      element: <AppDetailPage />,
      children: [
        {
          index: true,
          element: <Navigate to="versions" replace />,
        },
        {
          path: 'versions',
          element: <VersionList />,
        },
        {
          path: 'app-information',
          element: <AppInformation />,
        },
        {
          path: 'audit-records',
          element: <AuditRecords />,
        },
        {
          path: 'app-instances',
          element: <InstanceList />,
        },
      ],
    },
  ];
}
