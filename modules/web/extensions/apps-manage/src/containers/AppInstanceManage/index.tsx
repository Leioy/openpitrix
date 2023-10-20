import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { Link, useParams } from 'react-router-dom';
import { Banner, BannerTip, Button, Field, notify } from '@kubed/components';

import {
  Icon,
  Column,
  TableRef,
  DataTable,
  StatusIndicator,
  useItemActions,
  useTableActions,
  useBatchActions,
  DeleteConfirmModal,
  useListQueryParams,
  getLocalTime,
} from '@ks-console/shared';

import AppDeployModal from './AppDeployModal';
import { getApplicationUrl, useApplicationsList, useApplicationDeleteMutation } from '../../stores';
import type { Application } from '../../types/application';

const AddButton = styled(Button)`
  min-width: 96px;
`;

function AppInstanceManage(): JSX.Element {
  const { workspace = '', appName } = useParams();
  const repoListUrl = getApplicationUrl({ workspace, app_name: appName });
  const tableRef = useRef<TableRef>();
  const [modalType, setModalType] = useState<string>('');
  const [selectedRows, setSelectedRows] = useState<Application[]>();
  const { refresh } = useApplicationsList({ workspace }, { app_name: appName });
  const { mutate: mutateDelete, isLoading: isDeleting } = useApplicationDeleteMutation({
    onSuccess: () => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      closeModal();
      notify.success(t('DELETED_SUCCESSFUL'));
      tableRef?.current?.refetch();
    },
  });
  // const { mutateAsync, isLoading } = useApplicationsList(workspace);
  const tableParameters = {
    order: 'create_time',
    status: 'active',
  };
  const renderItemActions = useItemActions<Application>({
    authKey: 'app-InstanceManage',
    params: { workspace },
    actions: [
      {
        key: 'edit',
        icon: <Icon name="pen" />,
        text: t('EDIT_INFORMATION'),
        action: 'edit',
        onClick: (_, record) => {
          setSelectedRows([record]);
          setModalType('edit');
        },
      },
      {
        key: 'delete',
        icon: <Icon name="trash" />,
        text: t('DELETE'),
        action: 'delete',
        onClick: (_, record) => {
          setSelectedRows([record]);
          setModalType('delete');
        },
      },
    ],
  });
  const renderBatchActions = useBatchActions({
    authKey: 'app-InstanceManage',
    params: { workspace },
    actions: [
      {
        key: 'delete',
        text: t('DELETE'),
        action: 'delete',
        onClick: () => {
          const selectedFlatRows = tableRef?.current?.getSelectedFlatRows() || [];
          setSelectedRows(selectedFlatRows as unknown as Application[]);
          setModalType('delete');
        },
        props: { color: 'error' },
      },
    ],
  });
  const renderTableActions = useTableActions({
    authKey: 'app-InstanceManage',
    params: { workspace },
    actions: [
      {
        key: 'create',
        text: t('ADD'),
        action: 'manage',
        onClick: () => setModalType('create'),
        props: {
          color: 'secondary',
          shadow: true,
        },
      },
    ],
  });
  const columns: Column<Application>[] = [
    {
      title: t('NAME'),
      field: 'metadata.name',
      width: '25%',
      searchable: true,
      render: (name, record) => (
        <Field
          value={<Link to={record.metadata.name}>{name}</Link>}
          label={name || '-'}
          avatar={<Icon name="catalog" size={40} />}
        />
      ),
    },
    {
      title: t('STATUS'),
      field: 'status.state',
      canHide: true,
      width: '15%',
      render: (val = 'syncing') => (
        <StatusIndicator type={val as any}>
          {t(`APP_REPO_STATUS_${(val as string).toUpperCase()}`)}
        </StatusIndicator>
      ),
    },
    {
      title: t('APP_TEMPLATE'),
      field: 'metadata.resourceVersion',
    },
    {
      title: t('VERSIONS'),
      field: 'spec.appVersion_id',
    },
    {
      title: t('UPDATE_TIME_TCAP'),
      field: 'status.lastUpdate',
      canHide: true,
      width: '17%',
      render: time => getLocalTime(time || new Date().toDateString()).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      id: 'more',
      title: '',
      width: 20,
      render: renderItemActions,
    },
  ];

  function serverDataFormatter(serverData: any) {
    return {
      ...serverData,
      totalItems: serverData.total_count,
    };
  }

  function transformRequestParams(params: Record<string, any>): Record<string, any> {
    const { parameters, pageIndex, filters } = params;
    const keyword = filters?.[0]?.value;
    const formattedParams = useListQueryParams({
      ...parameters,
      page: pageIndex + 1,
    });

    if (!keyword) {
      return formattedParams;
    }

    return {
      ...formattedParams,
      conditions: formattedParams.conditions + `,keyword=${keyword}`,
    };
  }

  function closeModal(): void {
    setModalType('');
    setSelectedRows(undefined);
  }

  function handleManageOk(): void {
    refresh();
    closeModal();
  }

  async function handleRepoDelete(): Promise<void> {
    const InstanceManageId: string[] = selectedRows?.map(item => item.metadata.name) || [];
    await mutateDelete(InstanceManageId);
    closeModal();
  }

  return (
    <>
      <Banner
        className="mb12"
        icon={<Icon name="catalog" />}
        title={t('APP_INSTANCES_MANAGE')}
        description={t('APP_INSTANCES_MANAGE_DESC')}
      >
        <BannerTip title={t('HOW_TO_USE_APP_REPO_Q')} key="develop">
          {t('HOW_TO_USE_APP_REPO_A')}
        </BannerTip>
      </Banner>
      <DataTable
        ref={tableRef}
        rowKey="metadata.uid"
        tableName="APP_INSTANCES_MANAGE"
        url={repoListUrl}
        simpleSearch
        parameters={tableParameters}
        transformRequestParams={transformRequestParams}
        columns={columns}
        useStorageState={false}
        placeholder={t('SEARCH_BY_NAME')}
        toolbarRight={renderTableActions()}
        batchActions={renderBatchActions()}
        format={item => ({ ...item, workspace })}
        serverDataFormat={serverDataFormatter}
        emptyOptions={{
          withoutTable: true,
          createButton: (
            <AddButton color="secondary" onClick={() => setModalType('create')}>
              {t('ADD')}
            </AddButton>
          ),
          title: t('NO_APPLICATION_FOUND'),
          image: <Icon name="catalog" size={48} />,
          description: t('APPLICATION_EMPTY_DESC'),
        }}
      />
      {['create', 'edit'].includes(modalType) && (
        <AppDeployModal
          visible={true}
          onCancel={closeModal}
          onOk={handleManageOk}
          detail={selectedRows?.[0]}
        />
      )}
      {modalType === 'delete' && (
        <DeleteConfirmModal
          visible={true}
          type="APP_InstanceManageITORY"
          resource={selectedRows?.map((item: any) => item.name)}
          onOk={handleRepoDelete}
          onCancel={closeModal}
          confirmLoading={isDeleting}
        />
      )}
    </>
  );
}

export default AppInstanceManage;
