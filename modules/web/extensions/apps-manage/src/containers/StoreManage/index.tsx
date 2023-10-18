import React from 'react';
import { get } from 'lodash';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useStore } from '@kubed/stook';
import { Appcenter } from '@kubed/icons';
import { Banner, Field, Button } from '@kubed/components';

import {
  Image,
  Column,
  AppDetail,
  getLocalTime,
  StatusIndicator,
  transferAppStatus,
  useActionMenu,
  // getAppCategoryNames,
  getBrowserLang,
} from '@ks-console/shared';
import { useDisclosure } from '@kubed/hooks';
import CreateApp from '../AppCreate';
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
  const userLang = get(globals.user, 'lang') || getBrowserLang();
  const [, setSelectedApp] = useStore<AppDetail>('selectedApp');
  const { isOpen, open, close } = useDisclosure(false);

  const columns: Column[] = [
    {
      title: t('NAME'),
      field: 'metadata.name',
      width: '30%',
      searchable: true,
      render: (name, app) => (
        <TableItemField
          onClick={() => setSelectedApp(app as AppDetail)}
          label={app.spec.description[userLang]}
          value={<Link to={`/apps-manage/store/${app.metadata.name}`}>{name}</Link>}
          avatar={<Image iconSize={40} src={app.spec.icon} iconLetter={name} />}
        />
      ),
    },
    {
      title: t('STATUS'),
      field: 'status.state',
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
      field: 'metadata.resourceVersion',
      canHide: true,
      width: '16%',
    },
    {
      title: t('CATEGORY'),
      field: 'category_set',
      canHide: true,
      width: '17%',
      // TODO 此处后端未实现。接口未返回
      // render: categories => getAppCategoryNames(categories),
    },
    {
      title: t('UPDATE_TIME_TCAP'),
      field: 'status_time',
      canHide: true,
      width: '17%',
      render: time => getLocalTime(time || new Date().toDateString()).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];
  const renderBtn = (
    <Button variant="text" radius="lg" onClick={open}>
      创建应用
    </Button>
  );

  return (
    <>
      <Banner
        className="mb12"
        icon={<Appcenter />}
        title={t('APP_PL')}
        description={t('APP_STORE_DESC')}
      />
      <AppDataTable columns={columns} toolbarRight={renderBtn} />
      <CreateApp visible={isOpen} onCancel={close} />
    </>
  );
}

export default StoreManage;
