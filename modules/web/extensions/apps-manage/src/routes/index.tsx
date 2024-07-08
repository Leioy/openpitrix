import React from 'react';
import { Navigate } from 'react-router-dom';
import {
  AppInformation,
  AuditRecords,
  InstanceList,
  AppsDashBoard,
  AppBaseLayout,
  AppStoreDetails,
  WorkspaceLayout,
  WorkspaceListLayout,
} from '@ks-console/shared';
import { AppDeployDetailRoute } from '../shared';

import ListLayout from '../containers/Base/ListLayout';

import Reviews from '../containers/Reviews';
import RepoManage from '../containers/RepoManage';
import AppDetails from '../containers/AppDetail/routes';

import CategoriesManage from '../containers/CategoriesManage';
import ApplicationManage from '../containers/AppInstanceManage';
import StoreManage from '../containers/StoreManage';
import AppDetailPage from '../containers/AppDetailPage';
import VersionList from '../containers/AppDetail/VersionList';
const PATH = '/apps-manage';
const appTemplatePath = 'workspaces/:workspace/app-templates';

export default [
  {
    path: '/jsjk-apps',
    element: <AppBaseLayout />,
    children: [
      {
        index: true,
        element: <AppsDashBoard />,
      },
      { path: ':appName', element: <AppStoreDetails /> },
      { path: ':appName/deploy', element: <AppStoreDetails /> },
    ],
  },
  {
    path: PATH,
    element: <ListLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="store" replace />,
      },
      {
        path: 'store',
        element: <StoreManage />,
      },
      {
        path: 'categories',
        element: <CategoriesManage />,
      },
      {
        path: 'reviews',
        element: <Reviews />,
        children: [
          {
            index: true,
            element: <Navigate to="unprocessed" />,
          },
          {
            path: ':type',
            element: <></>,
          },
        ],
      },
      {
        path: 'repo',
        element: <RepoManage />,
      },
      {
        path: 'deploy',
        element: <ApplicationManage />,
      },
    ],
  },
  {
    path: '/apps-manage/store/:appName',
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
  {
    path: '/',
    element: <WorkspaceLayout />,
    children: [
      {
        path: appTemplatePath,
        element: <WorkspaceListLayout />,
        children: [
          {
            index: true,
            exact: true,
            element: <StoreManage />,
          },
        ],
      },
      ...AppDetails(appTemplatePath),
    ],
  },
  ...AppDeployDetailRoute('/apps-manage/deploy'),
];
