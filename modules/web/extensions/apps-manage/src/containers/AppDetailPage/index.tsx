import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '@kubed/stook';
import { notify } from '@kubed/components';
import { useParams } from 'react-router-dom';

import {
  Image,
  AppDetail,
  isRadonDB,
  getAvatar,
  DetailPagee,
  getLocalTime,
  openpitrixStore,
  InfoConfirmModal,
  transferAppStatus,
  getVersionTypesName,
  getAppCategoryNames,
} from '@ks-console/shared';

const PATH = '/apps-manage/store/:appId';

const { HANDLE_TYPE_TO_SHOW, useAppDetail, handleApp } = openpitrixStore;

function AppDetailPage(): JSX.Element {
  const { appId = '' } = useParams();
  const [detail, setDetail] = useStore<AppDetail>('selectedApp');
  const [modalType, setModalType] = useState<string>('');
  const defaultTabs = [
    {
      path: `${PATH}/versions`,
      title: 'VERSIONS',
    },
    {
      path: `${PATH}/app-information`,
      title: 'APP_INFORMATION',
    },
    {
      path: `${PATH}/audit-records`,
      title: 'APP_REVIEW',
    },
    {
      path: `${PATH}/app-instances`,
      title: 'APP_INSTANCES',
    },
  ];
  const tabs = useMemo(() => {
    if (isRadonDB(appId)) {
      return defaultTabs.filter(({ title }) => !['APP_RELEASE', 'APP_INSTANCES'].includes(title));
    }

    return defaultTabs;
  }, []);
  const actions = useMemo(() => {
    if (detail?.status === 'active') {
      return [
        {
          key: 'suspend',
          type: 'control',
          icon: 'sort-descending',
          text: t('SUSPEND'),
          onClick: () => setModalType('suspend'),
          props: {
            color: 'secondary',
          },
        },
      ];
    }

    return [
      {
        key: 'recover',
        type: 'control',
        icon: 'sort-ascending',
        text: t('RELEASE'),
        onClick: () => setModalType('recover'),
        props: {
          color: 'secondary',
        },
      },
    ];
  }, [detail?.status]);
  const { refetch: refetchAppDetails } = useAppDetail(
    { app_id: appId },
    {
      enabled: !detail && !!appId,
      onSuccess: appDetails => setDetail({ ...appDetails, refetchAppDetails }),
    },
  );
  const attrs = [
    {
      label: t('APP_ID'),
      value: detail?.app_id,
    },
    {
      label: t('STATUS'),
      value: transferAppStatus(detail?.status),
    },
    {
      label: t('CATEGORY'),
      value: getAppCategoryNames(detail?.category_set || []),
    },
    {
      label: t('TYPE'),
      value: getVersionTypesName(detail?.app_version_types || ''),
    },
    {
      label: t('WORKSPACE'),
      value: detail?.isv || '-',
    },
    {
      label: t('CREATION_TIME_TCAP'),
      value: getLocalTime(detail?.create_time || new Date().toDateString()).format(
        'YYYY-MM-DD HH:mm:ss',
      ),
    },
  ];

  function closeModal(): void {
    setModalType('');
  }

  async function handleConfirmOk(): Promise<void> {
    await handleApp(
      { app_id: detail?.app_id },
      {
        action: modalType,
        app_version_types: detail?.app_version_types,
      },
    );
    const type = HANDLE_TYPE_TO_SHOW[modalType] || modalType;
    notify.success(t(`${type.toUpperCase()}_SUCCESSFUL`));
    closeModal();
    refetchAppDetails();
  }

  useEffect(() => {
    // TODO: set isAdmin is true;
  }, []);

  return (
    <>
      <DetailPagee
        tabs={tabs}
        cardProps={{
          name: detail?.name,
          desc: detail?.description,
          icon: (
            <Image
              alt=""
              className="mr12"
              src={getAvatar(detail?.icon || '')}
              iconSize={32}
              iconLetter={detail?.name}
            />
          ),
          authKey: 'apps',
          actionOptions: { limit: 2, theme: 'dark' },
          attrs,
          actions,
          breadcrumbs: {
            label: t('APPS'),
            url: '/apps-manage/store',
          },
        }}
      />
      {!!modalType && (
        <InfoConfirmModal
          visible={true}
          onCancel={closeModal}
          onOk={handleConfirmOk}
          confirmLoading={false}
          content={t(`APP_${(modalType || 'suspend').toUpperCase()}_TIP`, { name: detail?.name })}
        />
      )}
    </>
  );
}

export default AppDetailPage;
