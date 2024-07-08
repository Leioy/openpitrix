import React, { ReactNode, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { SafeNotice } from '@kubed/icons';
import { Drawer, NavItem, Navs } from '@kubed/components';

import {
  Icon,
  TextPreview,
  PackageUpload,
  getPackageName,
  openpitrixStore,
  LabelText,
} from '@ks-console/shared';

import InfoDetail from './InfoDetail';

import { CloseModal, Header, Content, Footer, StyledButton } from './styles';

const { fileStore, useAppDetail, useVersionDetail } = openpitrixStore;

type Props = {
  visible: boolean;
  detail: any;
  onOk: () => void;
  onCancel: () => void;
  onReject: () => void;
  onDeploy: (data: any) => void;
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
  onDeploy,
}: Props): JSX.Element {
  const [tabKey, setTabKey] = useState<string>('appInfo');
  const appName = detail.metadata.labels['application.kubesphere.io/app-id'];
  const { data: appDetail } = useAppDetail({
    appName,
  });
  const { data: versionDetail } = useVersionDetail({
    appName,
    versionID: detail.metadata.name,
  });
  const { data: files = {} } = fileStore.useQueryFiles(
    { appName, versionID: detail.metadata.name },
    { enabled: !!appName && !!detail.metadata.name },
  );
  const readme = useMemo(() => {
    return files['README.md'];
  }, [files]);
  const navs: NavItem[] = [
    {
      label: t('APP_STORE_APP_INFORMATION'),
      value: 'appInfo',
    },
    {
      label: t('APP_STORE_DOCUMENTATION'),
      value: 'readme',
    },
    {
      label: t('APP_STORE_CHART_FILES'),
      value: 'configFiles',
    },
    {
      label: t('APP_STORE_UPDATE_LOG'),
      value: 'updateLog',
    },
  ];
  const navContentMap: Record<string, ReactNode> = {
    appInfo: <InfoDetail detail={appDetail} versionName={versionDetail?.metadata.name} />,
    readme: readme ? (
      <ReactMarkdown>{readme}</ReactMarkdown>
    ) : (
      <p>{t('APP_STORE_VERSION_INTRO_EMPTY_DESC')}</p>
    ),
    configFiles: (
      <>
        <PackageUpload
          hasPackage
          className="mb12"
          canEdit={false}
          fileStore={fileStore}
          appName={appDetail?.metadata.name}
          versionID={detail?.metadata.name}
          type={'MODIFY_VERSION'}
          packageName={getPackageName(versionDetail)}
          updateTime={detail?.update_time || detail?.status_time}
        />
        <TextPreview files={files} />
      </>
    ),
    updateLog: (
      <>
        <LabelText>{t('APP_STORE_UPDATE_LOG')}</LabelText>
        <pre>{versionDetail?.status.message || t('APP_STORE_NO_UPDATE_LOG_DESC')}</pre>
      </>
    ),
  };

  return (
    <Drawer maskClosable width={1070} placement="right" visible={visible} onClose={onCancel}>
      <CloseModal color="dark" shadow onClick={onCancel}>
        <Icon name="close" size={24} color="white" />
      </CloseModal>
      <Header
        icon={<SafeNotice />}
        title={t('APP_STORE_APP_DETAILS')}
        description={t('APP_STORE_APP_DETAILS_DESC')}
      >
        <Navs data={navs} value={tabKey} onChange={setTabKey} />
      </Header>
      <Content style={{ height: `calc(100vh - ${showFooter ? '266px' : '194px'})` }}>
        {tabKey && navContentMap[tabKey]}
      </Content>
      {showFooter && (
        <Footer>
          <StyledButton className="mr12" color="error" onClick={onReject}>
            {t('APP_STORE_REJECT')}
          </StyledButton>
          <StyledButton className="mr12" color="secondary" onClick={() => onDeploy(files)}>
            {t('APP_STORE_DEPLOYMENT')}
          </StyledButton>
          <StyledButton color="secondary" onClick={onOk} disabled={isConfirming}>
            {t('APP_STORE_APPROVE_AND_RELEASE')}
          </StyledButton>
        </Footer>
      )}
    </Drawer>
  );
}

export default DetailDrawer;
