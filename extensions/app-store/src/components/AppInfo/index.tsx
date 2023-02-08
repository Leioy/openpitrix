import React from 'react';

import VersionTable from './VersionTable';
import ReactMarkdown from 'react-markdown';

import { AppDetailWrapper, LabelText } from './styles';

type Props = {
  appDetail: AppDetail;
  versionDetail: LatestAppVersion[];
};

function AppInfo({ appDetail, versionDetail }: Props): JSX.Element {
  return (
    <AppDetailWrapper>
      <LabelText>{t('APP_INTRODUCTION')}</LabelText>
      <div style={{ marginBottom: '32px' }}>
        {appDetail?.abstraction ? (
          <ReactMarkdown>{appDetail.abstraction}</ReactMarkdown>
        ) : (
          t('NONE')
        )}
      </div>
      <LabelText>{t('APP_SCREENSHOTS')}</LabelText>
      {/* <ImageSlider images={this.filterImages(screenshots)} /> */}
      <div style={{ marginBottom: '32px' }}>{t('NONE')}</div>
      <LabelText>{t('APP_VERSIONS_TITLE')}</LabelText>
      <VersionTable versions={versionDetail} />
    </AppDetailWrapper>
  );
}

export default AppInfo;
