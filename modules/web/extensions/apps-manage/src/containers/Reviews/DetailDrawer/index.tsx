import React, { ReactNode, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { SafeNotice } from '@kubed/icons';
import { Drawer, NavItem, Navs } from '@kubed/components';

import {
  Icon,
  LabelText,
  TextPreview,
  PackageUpload,
  getPackageName,
  openpitrixStore,
} from '@ks-console/shared';

import InfoDetail from './InfoDetail';

import { CloseModal, Header, Content, Footer, StyledButton } from './styles';

type Props = {
  visible: boolean;
  detail: any;
  onOk: () => void;
  onCancel: () => void;
  onReject: () => void;
  showFooter?: boolean;
  isConfirming?: boolean;
};

function DetailDrawer({
  visible,
  detail,
  onOk,
  onCancel,
  onReject,
  isConfirming,
  showFooter,
}: Props): JSX.Element {
  const { fileStore, useAppDetail, useVersionDetail } = openpitrixStore;
  const [tabKey, setTabKey] = useState<string>('appInfo');
  const { data: appDetail } = useAppDetail({ app_name: detail.metadata.name });
  const { data: versionDetail } = useVersionDetail({
    app_name: detail.metadata.name,
    version_id: detail.spec.version_id, //TODO: 参数问题
  });

  console.log('versionDetail', detail, versionDetail);

  const { data: files = {} } = fileStore.useQueryFiles(
    { name: detail.app_id, version_id: detail.spec.version_id },
    { enabled: !!detail.app_id && !!detail.spec.version_id },
  );
  const readme = useMemo(() => {
    return files['README.md'];
  }, [files]);
  const navs: NavItem[] = [
    {
      label: t('APP_INFORMATION'),
      value: 'appInfo',
    },
    {
      label: t('DOCUMENTATION'),
      value: 'readme',
    },
    {
      label: t('CHART_FILES'),
      value: 'configFiles',
    },
    {
      label: t('UPDATE_LOG'),
      value: 'updateLog',
    },
  ];
  const navContentMap: Record<string, ReactNode> = {
    appInfo: <InfoDetail detail={appDetail} versionName={versionDetail?.metadata.name} />,
    readme: readme ? (
      <ReactMarkdown>{readme}</ReactMarkdown>
    ) : (
      <p>{t('VERSION_INTRO_EMPTY_DESC')}</p>
    ),
    configFiles: (
      <>
        <PackageUpload
          hasPackage
          className="mb12"
          canEdit={false}
          fileStore={fileStore}
          appName={detail?.metadata.name}
          versionId={detail?.spec?.version_id}
          type={'MODIFY_VERSION'}
          packageName={getPackageName(versionDetail, appDetail?.metadata.name)}
          updateTime={detail?.update_time || detail?.status_time}
        />
        <TextPreview files={files} />
      </>
    ),
    updateLog: (
      <>
        <LabelText>{t('UPDATE_LOG')}</LabelText>
        <pre>{versionDetail?.spec.description || t('NO_UPDATE_LOG_DESC')}</pre>
      </>
    ),
  };

  return (
    <Drawer maskClosable width={1070} placement="right" visible={visible} onClose={onCancel}>
      <CloseModal color="dark" shadow onClick={onCancel}>
        <Icon name="close" size={24} color="white" />
      </CloseModal>
      <Header icon={<SafeNotice />} title={t('APP_DETAILS')} description={t('APP_DETAILS_DESC')}>
        <Navs data={navs} value={tabKey} onChange={setTabKey} />
      </Header>
      <Content style={{ height: `calc(100vh - ${showFooter ? '266px' : '194px'})` }}>
        {tabKey && navContentMap[tabKey]}
      </Content>
      {showFooter && (
        <Footer>
          <StyledButton className="mr12" color="error" onClick={onReject}>
            {t('REJECT')}
          </StyledButton>
          <StyledButton color="secondary" onClick={onOk} disabled={isConfirming}>
            {t('APPROVE')}
          </StyledButton>
        </Footer>
      )}
    </Drawer>
  );
}

export default DetailDrawer;
