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
  getBrowserLang,
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
  const appName = detail.metadata.labels['app.kubesphere.io/app-id'];
  const { data: appDetail } = useAppDetail({
    app_name: appName,
  });
  const { data: versionDetail } = useVersionDetail({
    app_name: appName,
    version_id: detail.metadata.name,
  });
  const { data: files = {} } = fileStore.useQueryFiles(
    { name: appName, version_id: detail.metadata.name },
    { enabled: !!appName && !!detail.metadata.name },
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
          appName={appDetail?.metadata.name}
          versionId={detail?.metadata.name}
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
        <pre>{versionDetail?.spec.description[getBrowserLang()] || t('NO_UPDATE_LOG_DESC')}</pre>
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
          <StyledButton className="mr12" color="secondary" onClick={() => onDeploy(files)}>
            {t('DEPLOYMENT')}
          </StyledButton>
          <StyledButton color="secondary" onClick={onOk} disabled={isConfirming}>
            {t('APPROVE_AND_RELEASE')}
          </StyledButton>
        </Footer>
      )}
    </Drawer>
  );
}

export default DetailDrawer;
