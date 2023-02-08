import React from 'react';
import { parser } from '@ks-console/shared';

import { Image } from '../../../components';

import { AppBaseInfo, AppCardWrapper, StyledField, Vendor, Version } from './styles';

type Props = {
  app: AppDetail;
};

function AppCard({ app }: Props): JSX.Element {
  function getVendor(): string {
    const hasMaintainer = app.latest_app_version.maintainers;

    if (!hasMaintainer) {
      return t('MAINTAINER_VALUE', { value: '-' });
    }

    const maintainers = parser
      .safeParseJSON(hasMaintainer, [])
      .map((item: Record<string, any>) => item.name);

    return t('MAINTAINER_VALUE', { value: maintainers[0] || '-' });
  }

  return (
    <AppCardWrapper>
      <StyledField
        avatar={<Image iconSize={48} src={app.icon} iconLetter={app.name} alt="" />}
        label={app.description || '-'}
        value={app.name || '-'}
      />
      <AppBaseInfo>
        <Vendor>{getVendor()}</Vendor>
        <Version title={app.latest_app_version.name}>
          {t('LATEST_VALUE', { value: app.latest_app_version.name || '-' })}
        </Version>
      </AppBaseInfo>
    </AppCardWrapper>
  );
}

export default AppCard;
