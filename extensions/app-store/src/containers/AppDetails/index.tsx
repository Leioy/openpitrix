import React, { useEffect, useState } from 'react';
import { useStore } from '@kubed/stook';
import { useNavigate, useParams } from 'react-router-dom';
import { Col, Loading, Navs, Tab } from '@kubed/components';

import AppAgreementModal from './AppAgreementModal';
import { AppInfo, AppBase, AppPreview, AppVersionSelector } from '../../components';
import { fetchDetail, useQueryDataByResourceName } from '../../store';

import { AppInfoWrapper, DeployButton, StyledRow, StyledTabs, TabsWrapper } from './styles';

function AppDetails(): JSX.Element {
  const { appId } = useParams();
  const navigate = useNavigate();
  const [visible, setVisible] = useState<boolean>(false);
  const [selectedVersion] = useStore<string>('selectedVersion');
  const [, setCurrentStep] = useStore<number>('currentStep');
  const [appListIsLoading] = useStore<boolean>('appListIsLoading');
  const [appDetail, setAppDetail] = useStore<AppDetail>('appDetail');
  const [activeKey, setActiveKey] = useState<string>('appInfo');
  const [currentTab, setCurrentTab] = useState<string>('versionInfo');
  const { data: versionDetail } = useQueryDataByResourceName<LatestAppVersion>(
    'versions',
    { app_id: appId, status: 'active' },
    { autoFetch: !!appId },
  );

  function handleLink(): void {
    const link = `${location.pathname}/deploy${location.search}`;

    if (globals.user) {
      return navigate(link);
    }

    location.href = `/login?referer=${link}`;
  }

  function handleDeploy(): void {
    if (
      appDetail.isv !== 'system-workspace' ||
      localStorage.getItem(`${globals.user.username}-app-agreement`) === 'true'
    ) {
      return handleLink();
    }

    setVisible(true);
  }

  function handleAgree(): void {
    handleLink();
    setVisible(false);
  }

  useEffect(() => {
    setCurrentStep(-1);
    if (!appId) return;

    fetchDetail(appId).then(setAppDetail);
  }, []);

  if (appListIsLoading) {
    return <Loading className="page-loading" />;
  }

  return (
    <>
      <TabsWrapper>
        <div style={{ position: 'relative' }}>
          <DeployButton onClick={handleDeploy} color="dark">
            {t('INSTALL')}
          </DeployButton>
          <StyledTabs activeKey={activeKey} variant="outline" size="lg" onTabChange={setActiveKey}>
            <Tab label={t('APP_INFORMATION')} key="appInfo" className="test" />
            <Tab label={t('APP_DETAILS')} key="appDetails" />
          </StyledTabs>
        </div>
      </TabsWrapper>
      <AppInfoWrapper>
        {activeKey === 'appInfo' && (
          <StyledRow>
            <Col span={8}>
              <AppInfo appDetail={appDetail} versionDetail={versionDetail || []} />
            </Col>
            <Col span={4}>
              <AppBase app={appDetail} />
            </Col>
          </StyledRow>
        )}
        {activeKey === 'appDetails' && (
          <StyledRow>
            <Col span={8}>
              <Navs
                style={{ marginBottom: '20px' }}
                data={[
                  { label: t('APP_INTRODUCTION'), value: 'versionInfo' },
                  { label: t('CHART_FILES'), value: 'chartFiles' },
                ]}
                value={currentTab}
                onChange={setCurrentTab}
              />
              {appListIsLoading ? (
                <Loading className="page-loading" />
              ) : (
                <AppPreview
                  appId={appId ?? ''}
                  currentTab={currentTab}
                  versionId={selectedVersion}
                />
              )}
            </Col>
            <Col span={4}>
              <AppVersionSelector appDetail={appDetail} versions={versionDetail || []} />
            </Col>
          </StyledRow>
        )}
      </AppInfoWrapper>
      {visible && (
        <AppAgreementModal
          visible={visible}
          onOk={handleAgree}
          onCancel={() => setVisible(false)}
        />
      )}
    </>
  );
}

export default AppDetails;
