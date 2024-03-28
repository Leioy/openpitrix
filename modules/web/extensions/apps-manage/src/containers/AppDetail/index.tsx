import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '@kubed/stook';
import { useParams, useLocation } from 'react-router-dom';
import { notify } from '@kubed/components';
import {
  InfoConfirmModal,
  openpitrixStore,
  Image,
  getAuthKey,
  transferAppStatus,
  isRadonDB,
  getAvatar,
  getLocalTime,
  getAnnotationsDescription,
  getDisplayName,
  getWorkspacesAliasName,
  DetailPagee,
  getDetailMetadataCategory,
  AppType,
} from '@ks-console/shared';
import AppTemplateEdit from '../../components/AppTemplateEdit';
import type { AppDetail } from '@ks-console/shared';

const { useAppDetail, handleApp, useCategoryList, HANDLE_TYPE_TO_SHOW } = openpitrixStore;

export function AppDetailPage(): JSX.Element {
  const locations = useLocation();
  const { appName = '', workspace } = useParams();
  const url = workspace ? `/workspaces/${workspace}/app-templates` : '/apps-manage/store';
  const PATH = `${url}/:appName`;
  const defaultTabs = [
    {
      path: `${PATH}/versions`,
      title: t('VERSIONS'),
    },
    {
      path: `${PATH}/app-information`,
      title: t('APP_INFORMATION'),
    },
    // {
    //   path: `${PATH}/audit-records`,
    //   title: t('APP_REVIEW'),
    // },
    {
      path: `${PATH}/app-instances`,
      title: t('APP_INSTANCES'),
    },
  ];
  const [editVisible, setEditVisible] = useState(false);

  const tabs = useMemo(() => {
    if (isRadonDB(appName)) {
      return defaultTabs.filter(({ title }) => !['APP_RELEASE', 'APP_INSTANCES'].includes(title));
    }
    return defaultTabs;
  }, []);
  const { data: categories } = useCategoryList({
    options: {
      autoFetch: !!workspace,
      format: (item: any) => {
        return {
          value: item?.metadata?.name,
          label: getDetailMetadataCategory(item),
        };
      },
    },
  });

  const [detail, setDetail] = useStore<AppDetail>('selectedApp');
  const [actions, setActions] = useState<any>([]);
  const [modalType, setModalType] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (locations.search) {
      sessionStorage.setItem('appType', locations.search);
    }
  }, [locations.search]);
  function getActions(details: AppDetail) {
    const action = [
      {
        key: 'edit',
        action: 'workspace-view-create-app-templates',
        type: 'edit',
        icon: 'edit',
        text: t('EDIT'),
        onClick: () => {
          setEditVisible(true);
        },
        props: {
          color: 'secondary',
        },
      },
    ] as any;
    if (details?.status?.state === 'active' && !workspace) {
      action.push({
        key: 'suspend',
        action: 'manage',
        type: 'control',
        icon: 'sort-descending',
        text: t('APP_SUSPEND'),
        onClick: () => setModalType('suspended'),
        props: {
          color: 'secondary',
        },
      });
    } else if (['draft', 'suspended'].includes(details?.status?.state) && !workspace) {
      action.push({
        key: 'recover',
        action: 'manage',
        type: 'control',
        icon: 'sort-ascending',
        text: t('APP_LISTING'),
        onClick: () => setModalType('active'),
        props: {
          color: 'secondary',
        },
      });
    }
    setActions(action);
  }

  useEffect(() => {
    if (detail) {
      getActions(detail);
    }
  }, [detail, categories]);

  const { refetch: refetchAppDetails } = useAppDetail(
    { appName: appName, workspace },
    {
      enabled: !detail && !!appName,
      onSuccess: (appDetails: any) => {
        setDetail({ ...appDetails, refetchAppDetails });
      },
    },
  );

  const label = detail?.metadata?.labels?.['application.kubesphere.io/app-category-name'];

  const category = categories?.find((item: any) => item.value === label);

  const attrs = [
    {
      label: t('APP_ID'),
      value: detail?.metadata?.name,
    },
    {
      label: t('STATUS'),
      value: detail?.status?.state && transferAppStatus(detail?.status?.state),
    },
    {
      label: t('CATEGORY'),
      // @ts-ignore
      value: category?.label || label,
      icon: 'edit',
    },
    {
      label: t('TYPE'),
      // @ts-ignore
      value: t(AppType[detail?.spec.appType]),
    },
    {
      label: t('WORKSPACE'),
      value: getWorkspacesAliasName(detail?.metadata?.labels?.['kubesphere.io/workspace'] || '-'),
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
    setLoading(true);
    handleApp(
      { appName: detail?.metadata.name },
      {
        state: modalType,
        appType: detail?.spec.appType,
      },
    )
      .then(() => {
        const type = HANDLE_TYPE_TO_SHOW[modalType] || modalType;
        notify.success(t(`APP_${type.toUpperCase()}_SUCCESSFUL`));
        closeModal();
        refetchAppDetails();
      })
      .finally(() => {
        setTimeout(() => {
          setLoading(false);
        }, 300);
      });
  }

  const authKey = getAuthKey();

  function editSuccess() {
    refetchAppDetails();
  }
  return (
    <>
      <DetailPagee
        tabs={tabs}
        refresh={!loading}
        cardProps={{
          name: getDisplayName(detail),
          desc: getAnnotationsDescription(detail),
          icon: (
            <Image
              alt=""
              className="mr12"
              isBase64Str={!!detail?.spec.icon}
              src={getAvatar(detail?.spec.icon || '')}
              iconSize={32}
              iconLetter={detail?.metadata.name}
            />
          ),
          authKey,
          params: { workspace },
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
      <AppTemplateEdit
        onCancel={() => setEditVisible(false)}
        visible={editVisible}
        detail={detail}
        success={editSuccess}
      />
    </>
  );
}

export default AppDetailPage;
