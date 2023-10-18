import React, { useEffect, useMemo, useState } from 'react';
import { get } from 'lodash';
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
  getBrowserLang,
} from '@ks-console/shared';

const PATH = '/apps-manage/store/:appName';

const { HANDLE_TYPE_TO_SHOW, useAppDetail, handleApp } = openpitrixStore;

function AppDetailPage(): JSX.Element {
  const { appName = '' } = useParams();
  const userLang = (get(globals.user, 'lang') || getBrowserLang()) as 'zh';

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
    if (isRadonDB(appName)) {
      return defaultTabs.filter(({ title }) => !['APP_RELEASE', 'APP_INSTANCES'].includes(title));
    }

    return defaultTabs;
  }, []);
  const actions = useMemo(() => {
    if (detail?.status?.state === 'active') {
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
    { name: appName },
    {
      enabled: !detail && !!appName,
      onSuccess: appDetails => setDetail({ ...appDetails, refetchAppDetails }),
    },
  );
  const attrs = [
    {
      label: t('APP_ID'),
      value: detail?.metadata?.uid,
    },
    {
      label: t('STATUS'),
      value: transferAppStatus(detail?.status.state),
    },
    {
      label: t('CATEGORY'),
      // TODO 缺少category
      value: 'CATEGORY',
      // value: getAppCategoryNames(detail?.category_set || []),
    },
    {
      label: t('TYPE'),
      // TODO 缺少 app_version_types
      value: 'TYPE',
      // value: getVersionTypesName(detail?.app_version_types || ''),
    },
    {
      label: t('WORKSPACE'),
      // TODO 缺少 isv
      value: detail?.isv || '-',
    },
    {
      label: t('CREATION_TIME_TCAP'),
      value: getLocalTime(detail?.metadata.creationTimestamp || new Date().toDateString()).format(
        'YYYY-MM-DD HH:mm:ss',
      ),
    },
  ];

  function closeModal(): void {
    setModalType('');
  }

  async function handleConfirmOk(): Promise<void> {
    await handleApp(
      { app_id: detail?.metadata.name },
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
          name: detail?.metadata.name,
          desc: detail?.spec.description[userLang],
          icon: (
            <Image
              alt=""
              className="mr12"
              src={getAvatar(detail?.spec.icon || '')}
              iconSize={32}
              iconLetter={detail?.metadata.name}
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
          content={t(`APP_${(modalType || 'suspend').toUpperCase()}_TIP`, {
            name: detail?.metadata.name,
          })}
        />
      )}
    </>
  );
}

export default AppDetailPage;
