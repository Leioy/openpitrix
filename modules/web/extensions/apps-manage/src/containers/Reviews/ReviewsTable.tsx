import React, { useRef, useState } from 'react';
import { pick } from 'lodash';
import { notify } from '@kubed/components';

import { Icon, TableRef } from '@ks-console/shared';
import {
  Image,
  Column,
  DataTable,
  getLocalTime,
  useItemActions,
  StatusIndicator,
  openpitrixStore,
  useListQueryParams,
} from '@ks-console/shared';

import store from './store';
import DetailDrawer from './DetailDrawer';
import { TableItemField } from '../StoreManage';
import { transferReviewStatus } from '../../utils';
import ReviewRejectModal from './ReviewRejectModal';
import type { RejectFormData } from './ReviewRejectModal';

type Props = {
  type: string;
};

function ReviewsTable({ type }: Props): JSX.Element {
  const { getBaseUrl, REVIEW_QUERY_STATUS } = openpitrixStore;
  const tableRef = useRef<TableRef<any>>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<any>();
  const queryParams: Record<string, any> = {
    order: 'status_time',
    status: REVIEW_QUERY_STATUS[type],
  };
  const renderItemActions = useItemActions({
    authKey: 'apps',
    actions: [
      {
        key: 'detail',
        icon: <Icon name="eye" />,
        text: t('VIEW_DETAILS'),
        action: 'view',
        onClick: (_, record) => {
          showReview(record)
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
          avatar={<Image src={item.icon} iconSize={40} iconLetter={item.app_name} />}
          value={item.app_name}
          label={item.version_name || '-'}
        />
      ),
    },
    {
      title: t('WORKSPACE'),
      field: 'app_id',
      canHide: true,
      width: '15%',
      render: (_, item) => item.isv || '-',
    },
    {
      title: t('OPERATOR'),
      field: 'reviewer',
      canHide: true,
      width: '15%',
    },
    {
      title: t('STATUS'),
      field: 'status',
      canHide: true,
      width: '15%',
      render: status => {
        const transStatus = transferReviewStatus(status);

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
      render: time => getLocalTime(time || new Date().toDateString()).format('YYYY-MM-DD HH:mm:ss'),
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
    return {
      ...serverData,
      totalItems: serverData.total_count,
    };
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

  const handleSubmit = async (action: string, data?: RejectFormData) => {
    setIsSubmitting(true);
    const pathParams = pick(selectedRow, ['metadata']);

    setIsSubmitting(false);
    await store.handleReview({ app_name: pathParams.metadata.name, action, ...data });
    onCancel();
    notify.success(t(action === 'pass' ? 'RELEASE_SUCCESSFUL' : 'REJECT_SUCCESSFUL'));
    tableRef.current?.refetch();
  };

  return (
    <>
      <DataTable
        simpleSearch
        ref={tableRef}
        tableName="APP_REVIEW"
        rowKey="version_id"
        // TODO reviews
        url={getBaseUrl({}, 'apps')}
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
          onOk={() => handleSubmit('pass')}
          onCancel={onCancel}
          onReject={showReject}
          isConfirming={isSubmitting}
          showFooter={type !== 'unprocessed'}
        />
      )}
      {showRejectModal && (
        <ReviewRejectModal
          visible={true}
          onOk={data => handleSubmit('reject', data)}
          onCancel={closeRejectModal}
        />
      )}
    </>
  );
}

export default ReviewsTable;
