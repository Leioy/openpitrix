import React, { ReactNode, useState, useRef } from 'react';
import { get } from 'lodash';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useStore } from '@kubed/stook';
import { Appcenter } from '@kubed/icons';
import { Banner, Field, notify } from '@kubed/components';
import {
  Image,
  Column,
  AppDetail,
  getLocalTime,
  StatusIndicator,
  transferAppStatus,
  // useActionMenu,
  // getAppCategoryNames,
  getBrowserLang,
  useItemActions,
  Icon,
  useTableActions,
  DeleteConfirmModal,
} from '@ks-console/shared';
import { deleteApp } from '../../stores';
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

enum AppType {
  'helm' = 'helm 应用',
  'yaml' = 'yaml 应用',
  'edge' = '边缘模板应用',
}

function StoreManage(): JSX.Element {
  const { workspace } = useParams();
  const userLang = get(globals.user, 'lang') || getBrowserLang();
  const tableRef = useRef();
  const [selectData, setSelectedApp] = useStore<AppDetail>('selectedApp');
  const { isOpen, open, close } = useDisclosure(false);
  const [delVisible, setDelVisible] = useState(false);

  async function handleDelete() {
    await deleteApp({ app_name: selectData.metadata.name });
    setDelVisible(false);
    tableRef?.current?.refetch();
    notify.success(t('DELETED_SUCCESSFULLY'));
  }
  const renderItemActions = useItemActions<AppDetail>({
    authKey: 'app-repos',
    params: {},
    actions: [
      {
        key: 'delete',
        icon: <Icon name="trash" />,
        text: t('DELETE'),
        action: 'delete',
        onClick: (_, record) => {
          setDelVisible(true);
          setSelectedApp(record);
        },
      },
    ],
  });

  const columns: Column<AppDetail>[] = [
    {
      title: t('NAME'),
      field: 'metadata.name',
      width: '20%',
      searchable: true,
      render: (name, app) => {
        return (
          <TableItemField
            onClick={() => setSelectedApp(app as AppDetail)}
            label={app.spec.description[userLang]}
            value={<Link to={`${name}?appType=${app.spec.appType}`}>{name}</Link>}
            avatar={<Image iconSize={40} src={app.spec.icon} iconLetter={name} />}
          />
        );
      },
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
      field: 'metadata.labels["kubesphere.io/workspace"]',
      canHide: true,
      width: '10%',
      render: (_, record) => record?.metadata.labels['kubesphere.io/workspace'],
    },
    {
      title: t('LATEST_VERSION'),
      field: 'metadata.resourceVersion',
      canHide: true,
      width: '16%',
      render: (_, record) => record?.metadata.annotations['app.kubesphere.io/latest-app-version'],
    },
    {
      title: t('CATEGORY'),
      field: 'category_set',
      canHide: true,
      width: '17%',
      render: (_, record) => record?.metadata.annotations['app.kubesphere.io/app-category-name'],
    },
    {
      title: t('App Templates'),
      field: 'spec.appType',
      canHide: true,
      width: '17%',
      // TODO 此处后端未实现。接口未返回
      // @ts-ignore
      render: types => AppType[types as typeof AppType],
    },
    {
      title: t('UPDATE_TIME_TCAP'),
      field: 'status.updateTime',
      canHide: true,
      width: '20%',
      render: time => getLocalTime(time || new Date().toDateString()).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      id: 'more',
      title: '',
      width: 20,
      render: renderItemActions as unknown as () => ReactNode,
    },
  ];
  const tableActions = useTableActions({
    authKey: 'app-templates',
    params: { workspace },
    actions: [
      {
        key: 'create',
        text: t('CREATE'),
        action: 'create',
        onClick: () => open(),
        props: {
          color: 'secondary',
          shadow: true,
        },
      },
    ],
  });

  return (
    <>
      <Banner
        className="mb12"
        icon={<Appcenter />}
        title={t('App Templates')}
        description={t('APP_STORE_DESC')}
      />
      <AppDataTable
        filter
        tableRef={tableRef}
        columns={columns}
        toolbarRight={workspace && tableActions()}
      />
      <CreateApp visible={isOpen} workspace={workspace} onCancel={close} tableRef={tableRef} />
      <DeleteConfirmModal
        visible={delVisible}
        type="APP_REPOSITORY"
        resource={selectData?.metadata.name}
        onOk={handleDelete}
        onCancel={() => setDelVisible(false)}
        confirmLoading={false}
      />
    </>
  );
}

export default StoreManage;
