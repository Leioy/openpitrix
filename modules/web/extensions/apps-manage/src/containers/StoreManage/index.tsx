import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useStore } from '@kubed/stook';
import { Appcenter } from '@kubed/icons';
import { Banner, Field } from '@kubed/components';

import {
  Image,
  Column,
  AppDetail,
  getLocalTime,
  StatusIndicator,
  transferAppStatus,
  getAppCategoryNames,
} from '@ks-console/shared';

import AppDataTable from '../../components/AppDataTable';

export const TableItemField = styled(Field)`
  .field-avatar {
    span {
      margin-right: 0;
    }
  }

  .field-value {
    cursor: pointer;
  }

  .field-label {
    max-width: 300px;
  }
`;

function StoreManage(): JSX.Element {
  const [, setSelectedApp] = useStore<AppDetail>('selectedApp');
  const columns: Column[] = [
    {
      title: t('NAME'),
      field: 'name',
      width: '30%',
      searchable: true,
      render: (name, app) => (
        <TableItemField
          onClick={() => setSelectedApp(app as AppDetail)}
          label={app.description}
          value={<Link to={`/apps-manage/store/${app.app_id}`}>{name}</Link>}
          avatar={<Image iconSize={40} src={app.icon} iconLetter={name} />}
        />
      ),
    },
    {
      title: t('STATUS'),
      field: 'status',
      canHide: true,
      width: '10%',
      render: status => (
        <StatusIndicator type={status}>{transferAppStatus(status)}</StatusIndicator>
      ),
    },
    {
      title: t('WORKSPACE'),
      field: 'isv',
      canHide: true,
      width: '10%',
    },
    {
      title: t('LATEST_VERSION'),
      field: 'latest_app_version.name',
      canHide: true,
      width: '16%',
    },
    {
      title: t('CATEGORY'),
      field: 'category_set',
      canHide: true,
      width: '17%',
      render: categories => getAppCategoryNames(categories),
    },
    {
      title: t('UPDATE_TIME_TCAP'),
      field: 'status_time',
      canHide: true,
      width: '17%',
      render: time => getLocalTime(time || new Date().toDateString()).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  return (
    <>
      <Banner
        className="mb12"
        icon={<Appcenter />}
        title={t('APP_PL')}
        description={t('APP_STORE_DESC')}
      />
      <AppDataTable columns={columns} />
    </>
  );
}

export default StoreManage;
