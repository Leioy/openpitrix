import React, { useRef, useState } from 'react';
import { notify } from '@kubed/components';
import { Icon, TableRef, getAnnotationsDescription } from '@ks-console/shared';
import {
  Image,
  Column,
  DataTable,
  getLocalTime,
  useItemActions,
  StatusIndicator,
  openpitrixStore,
  useListQueryParams,
  AppsDeploySpaceModal,
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
const { REVIEW_QUERY_STATUS } = openpitrixStore;

function ReviewsTable({ type }: Props): JSX.Element {
  const tableRef = useRef<TableRef<any>>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeploy, setIsDeploy] = useState<boolean>(false);

  const [selectedRow, setSelectedRow] = useState<any>();
  const selectedVersionId = selectedRow?.metadata.name;
  const appName = selectedRow?.metadata?.labels['application.kubesphere.io/app-id'];

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
            <Image src={item.spec.icon} iconSize={40} iconLetter={item.spec.appType || '-'} />
          }
          value={item.metadata.name}
          label={getAnnotationsDescription(item) || '-'}
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
      title: t('Submitter'),
      field: 'reviewer',
      canHide: true,
      width: '15%',
      render: (_, item) => item?.status?.userName || '-',
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
            {t(`APP_VERSION_STATUS_${transStatus.toUpperCase().replace(/-/g, '_')}`)}
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
    const { parameters, pageIndex, pageSize, filters } = params;
    const keyword = filters?.[0]?.value;
    const formattedParams: Record<string, any> = useListQueryParams({
      ...parameters,
    });
    formattedParams.page = pageIndex + 1;
    formattedParams.limit = pageSize;
    if (!keyword) {
      return formattedParams;
    }

    return {
      ...formattedParams,
      name: keyword,
      conditions: formattedParams.conditions,
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
      appName,
      versionID: selectedRow.metadata.name,
      // @ts-ignore TODO
      state: action,
      // userName: globals.user.username,
      message,
    });
    setIsSubmitting(false);
    onCancel();
    notify.success(t(action === 'active' ? 'RELEASE_SUCCESSFUL' : 'REJECT_SUCCESSFUL'));
    tableRef.current?.refetch();
  };

  return (
    <>
      <DataTable
        simpleSearch
        ref={tableRef}
        tableName="APP_REVIEW"
        rowKey="versionID"
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
          onDeploy={() => setIsDeploy(true)}
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
      <AppsDeploySpaceModal
        onCancel={() => setIsDeploy(false)}
        success={() => {}}
        visible={isDeploy}
        versionID={selectedVersionId}
        appName={appName as string}
        detail={selectedRow}
      />
    </>
  );
}

export default ReviewsTable;
