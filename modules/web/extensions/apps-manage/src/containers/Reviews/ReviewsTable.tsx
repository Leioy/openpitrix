import React, { useEffect, useRef, useState } from 'react';
import { notify } from '@kubed/components';
import { omit } from 'lodash';
import { Icon, TableRef, getBrowserLang } from '@ks-console/shared';
import {
  Image,
  Column,
  DataTable,
  getLocalTime,
  useItemActions,
  StatusIndicator,
  openpitrixStore,
  useListQueryParams,
  DeployVersionModal,
  DeployYamlModal,
  useV3action,
  safeBtoa,
  ChooseSpaceModal,
} from '@ks-console/shared';
import { getReviewsUrl } from '../../stores';

import store from './store';
import DetailDrawer from './DetailDrawer';
import { TableItemField } from '../CategoriesManage/styles';
import { transferReviewStatus } from '../../utils';
import ReviewRejectModal from './ReviewRejectModal';

type Props = {
  type: string;
};
const { REVIEW_QUERY_STATUS, deployApp } = openpitrixStore;

function ReviewsTable({ type }: Props): JSX.Element {
  const { open, render: renderEdgeModal } = useV3action('batch.deploy.app.create.v2');

  const tableRef = useRef<TableRef<any>>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeploy, setIsDeploy] = useState<boolean>(false);
  const [isChooseSpace, setIsChooseSpace] = useState<boolean>(false);
  const [placement, setPlacementData] = useState<{
    namespace?: string;
    workspace?: string;
    cluster?: string;
  }>({});

  const [selectedRow, setSelectedRow] = useState<any>();
  const selectedVersionId = selectedRow?.metadata.name;
  const appName = selectedRow?.metadata?.labels['app.kubesphere.io/app-id'];

  const userLang = getBrowserLang();
  const queryParams: Record<string, any> = {
    order: 'status_time',
    status: REVIEW_QUERY_STATUS[type],
  };
  const renderItemActions = useItemActions({
    authKey: 'manage-app',
    actions: [
      {
        key: 'detail',
        icon: <Icon name="eye" />,
        text: t('VIEW_DETAILS'),
        action: 'view',
        onClick: (_, record) => {
          showReview(record);
        },
      },
    ],
  });
  const columns: Column[] = [
    {
      title: t('NAME'),
      field: 'review_id',
      width: '30%',
      searchable: true,
      render: (_, item) => (
        <TableItemField
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          onClick={() => showReview(item)}
          avatar={
            <Image
              src={item.spec.icon}
              iconSize={40}
              iconLetter={item.spec.description?.[userLang] || '-'}
            />
          }
          value={item.metadata.name}
          label={item.spec.description?.[userLang] || '-'}
        />
      ),
    },
    {
      title: t('WORKSPACE'),
      field: 'app_id',
      canHide: true,
      width: '15%',
      render: (_, item) => item?.metadata?.labels?.['kubesphere.io/workspace'] || '-',
    },
    {
      title: t('OPERATOR'),
      field: 'reviewer',
      canHide: true,
      width: '15%',
      render: (_, item) => item?.metadata?.annotations?.['kubesphere.io/creator'] || '-',
    },
    {
      title: t('STATUS'),
      field: 'status',
      canHide: true,
      width: '15%',
      render: status => {
        const transStatus = transferReviewStatus(status?.state);

        return (
          <StatusIndicator type={transStatus as any}>
            {t(`APP_STATUS_${transStatus.toUpperCase().replace(/-/g, '_')}`)}
          </StatusIndicator>
        );
      },
    },
    {
      title: t('UPDATE_TIME_TCAP'),
      field: 'status_time',
      canHide: true,
      width: '15%',
      render: (_, item) => {
        const time = item?.spec?.created || '';
        return getLocalTime(time || new Date().toDateString()).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      id: 'more',
      title: '',
      width: 20,
      render: renderItemActions,
    },
  ];

  const transformRequestParams = (params: Record<string, any>): Record<string, any> => {
    const { parameters, pageIndex, filters } = params;
    const keyword = filters?.[0]?.value;
    const formattedParams: Record<string, any> = useListQueryParams({
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
  };

  const formatServerData = (serverData: Record<string, any>) => {
    return serverData;
  };

  const onCancel = () => {
    setVisible(false);
    setShowRejectModal(false);
  };

  const showReview = (item: any) => {
    setSelectedRow(item);
    setVisible(true);
  };

  const showReject = () => setShowRejectModal(true);

  const closeRejectModal = () => setShowRejectModal(false);

  const handleSubmit = async (action: string, message?: string) => {
    setIsSubmitting(true);

    await store.handleReview({
      app_name: appName,
      versionId: selectedRow.metadata.name,
      // @ts-ignore TODO
      state: action,
      user_name: globals.user.username,
      message,
    });
    setIsSubmitting(false);
    onCancel();
    notify.success(t(action === 'passed' ? 'RELEASE_SUCCESSFUL' : 'REJECT_SUCCESSFUL'));
    tableRef.current?.refetch();
  };

  const handleDeploy = async (data: any): Promise<void> => {
    console.log(data);
    const params = {
      kind: 'ApplicationRelease',
      metadata: {
        name: data?.name,
        annotations: {
          ...data.annotations,
          'app.kubesphere.io/description': data.description,
          'app.kubesphere.io/app-displayName': data.displayName,
          'app.kubesphere.io/app-versionName': data.versionName,
        },
        labels: {
          // cluster = '', workspace = '', namespace
          'kubesphere.io/namespace': placement.namespace,
          'kubesphere.io/workspace': placement.workspace,
          'kubesphere.io/cluster': placement.cluster,
          'kubesphere.io/app-id': data.app_name,
        },
      },
      spec: {
        app_id: data.app_name,
        app_type: data.app_type,
        appVersion_id: data?.version_id,
        values: safeBtoa(data.conf) || data.package,
      },
    };

    // TODO 临时取消 cluster、workspace、namespace
    await deployApp(omit(params, ['cluster', 'workspace', 'namespace']), {
      // cluster,
      // workspace,
      // namespace,
    });
    tableRef?.current?.refetch();
    setIsDeploy(false);
    notify.success(t('DEPLOYED_SUCCESSFUL'));
  };

  function onDeploy(files: any) {
    setSelectedRow({
      ...selectedRow,
      ...files,
    });
    if (selectedRow.spec.appType !== 'helm') {
      setIsChooseSpace(true);
    } else {
      setIsDeploy(true);
    }
  }

  function getSpaceData({
    data: placementData,
  }: {
    data: { namespace: string; workspace: string; cluster: string };
  }) {
    setPlacementData(placementData);
    setIsChooseSpace(false);
    setIsDeploy(true);
  }
  function renderSpaceModal() {
    if (!isChooseSpace) {
      return null;
    }
    return (
      // @ts-ignore TODO
      <ChooseSpaceModal
        dafaultVal={{}}
        visible
        // @ts-ignore TODO
        onOk={getSpaceData}
        onCancel={() => setIsChooseSpace(false)}
      />
    );
  }

  function renderModal() {
    const modalType = selectedRow?.spec.appType;

    if (!isDeploy || !selectedRow) {
      return null;
    }
    if (modalType === 'edge') {
      open({
        v3Module: 'edgeStore',
        module: 'edgeappsets',
        ...selectedRow,
        ...placement,
        versionId: selectedVersionId,
        appName,
        v3StoreParams: {
          module: 'edgeappsets',
        },
        success: () => {
          notify.success(t('UPDATE_SUCCESSFUL'));
          tableRef?.current?.refetch();
          setIsDeploy(false);
        },
      });
      return null;
    }
    if (modalType === 'helm') {
      return (
        <DeployVersionModal
          visible={true}
          appName={appName}
          detail={selectedRow}
          onCancel={() => setIsDeploy(false)}
          onOk={handleDeploy}
        />
      );
    }
    return (
      <DeployYamlModal
        visible={true}
        // @ts-ignore TODO
        {...placement}
        // @ts-ignore TODO
        namespace={placement.namespace}
        detail={selectedRow}
        versionId={selectedVersionId}
        onCancel={() => setIsDeploy(false)}
        onOk={handleDeploy}
      />
    );
  }

  return (
    <>
      <DataTable
        simpleSearch
        ref={tableRef}
        tableName="APP_REVIEW"
        rowKey="version_id"
        url={getReviewsUrl({})}
        parameters={queryParams}
        columns={columns}
        format={data => data}
        transformRequestParams={transformRequestParams}
        serverDataFormat={formatServerData}
        emptyOptions={{
          withoutTable: true,
          image: <Icon name="safeNotice" size={48} />,
          title: t('APP_REVIEW_UNPROCESSED_EMPTY_DESC'),
          description: t('APP_REVIEW_EMPTY_DESC'),
        }}
      />
      {visible && (
        <DetailDrawer
          visible={true}
          detail={selectedRow}
          onOk={() => handleSubmit('active')}
          onCancel={onCancel}
          onReject={showReject}
          onDeploy={onDeploy}
          isConfirming={isSubmitting}
          showFooter={type === 'unprocessed'}
        />
      )}
      {showRejectModal && (
        <ReviewRejectModal
          visible={true}
          onOk={data => handleSubmit('rejected', data.message)}
          onCancel={closeRejectModal}
        />
      )}
      {renderSpaceModal()}
      {renderModal()}
      {renderEdgeModal?.()}
    </>
  );
}

export default ReviewsTable;
