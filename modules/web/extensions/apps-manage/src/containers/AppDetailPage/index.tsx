import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '@kubed/stook';
import { notify } from '@kubed/components';
import { useParams, useLocation } from 'react-router-dom';

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
  // getVersionTypesName,
  // getAppCategoryNames,
  getBrowserLang,
} from '@ks-console/shared';
import {getAuthKey} from "../../utils";

const { HANDLE_TYPE_TO_SHOW, useAppDetail, handleApp } = openpitrixStore;

function AppDetailPage(): JSX.Element {
  const { appName = '', workspace } = useParams();
  const PATH = workspace ? '/workspaces/:workspace/store/:appName' : '/apps-manage/store/:appName';

  const locations = useLocation();
  useEffect(() => {
    if (locations.search) {
      sessionStorage.setItem('app_type', locations.search);
    }
  }, [locations.search]);
  const userLang = getBrowserLang();

  const [detail, setDetail] = useStore<AppDetail>('selectedApp');
  const [modalType, setModalType] = useState<string>('');
  const defaultTabs = [
    {
      path: `${PATH}/versions`,
      title: t('VERSIONS'),
    },
    {
      path: `${PATH}/app-information`,
      title: t('APP_INFORMATION'),
    },
    // TODO 临时注释
    // {
    //   path: `${PATH}/audit-records`,
    //   title: t('APP_REVIEW'),
    // },
    {
      path: `${PATH}/app-instances`,
      title: t('APP_INSTANCES'),
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
          onClick: () => setModalType('suspended'),
          props: {
            color: 'secondary',
          },
        },
      ];
    } else if (detail?.status?.state !== 'suspended') {
      return [];
    }

    return [
      {
        key: 'recover',
        type: 'control',
        icon: 'sort-ascending',
        text: t('RELEASE'),
        onClick: () => setModalType('active'),
        props: {
          color: 'secondary',
        },
      },
    ];
  }, [detail?.status]);
  const { refetch: refetchAppDetails } = useAppDetail(
    { app_name: appName, workspace },
    {
      enabled: !detail && !!appName,
      onSuccess: appDetails => {
        setDetail({ ...appDetails, refetchAppDetails });
      },
    },
  );
  const attrs = [
    {
      label: t('APP_ID'),
      value: detail?.metadata?.uid,
    },
    {
      label: t('STATUS'),
      value: detail?.status?.state && transferAppStatus(detail?.status?.state),
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
      value: detail?.metadata?.labels?.['kubesphere.io/workspace'] || '-',
    },
    {
      label: t('CREATION_TIME_TCAP'),
      value: getLocalTime(detail?.metadata?.creationTimestamp || new Date().toDateString()).format(
        'YYYY-MM-DD HH:mm:ss',
      ),
    },
  ];

  function closeModal(): void {
    setModalType('');
  }

  async function handleConfirmOk(): Promise<void> {
    await handleApp(
      { app_name: detail?.metadata.name },
      {
        state: modalType,
        app_version_types: detail?.spec.appType,
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

  const url = workspace ? `/workspaces/${workspace}/store` : '/apps-manage/store';
  const authKey = getAuthKey();

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
          authKey,
          actionOptions: { limit: 2, theme: 'dark' },
          attrs,
          actions,
          breadcrumbs: {
            label: t('APPS'),
            url: url,
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
