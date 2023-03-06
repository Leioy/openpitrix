import React from 'react';
import { get, isEmpty } from 'lodash';
import { formatTime, parser } from '@ks-console/shared';

import { getAppCategoryNames } from '../../utils';

import { LabelText } from '../AppInfo/styles';
import { AppBaseWrapper, BaseItem, ItemLabel, ItemValue } from './styles';

type Props = {
  app?: AppDetail;
};
function AppBase({ app }: Props): JSX.Element {
  const maintainers = parser
    .safeParseJSON(get(app, 'latest_app_version.maintainers', []), [])
    .map((item: any) => item.name);
  const sources = parser.safeParseJSON(get(app, 'latest_app_version.sources', []), []);

  return (
    <AppBaseWrapper>
      <LabelText>{t('BASIC_INFORMATION')}</LabelText>
      <BaseItem>
        <ItemLabel>{t('CATEGORY_COLON')}</ItemLabel>
        <ItemValue>{getAppCategoryNames(get(app, 'category_set', []))}</ItemValue>
      </BaseItem>
      <BaseItem>
        <ItemLabel>{t('HOMEPAGE_COLON')}</ItemLabel>
        <ItemValue>{app?.home || '-'}</ItemValue>
      </BaseItem>
      <BaseItem>
        <ItemLabel>{t('RELEASE_DATE_COLON')}</ItemLabel>
        <ItemValue>{app?.status_time ? formatTime(app?.status_time, 'YYYY-MM-DD') : '-'}</ItemValue>
      </BaseItem>
      <BaseItem>
        <ItemLabel>{t('APP_ID_COLON')}</ItemLabel>
        <ItemValue>{app?.app_id || '-'}</ItemValue>
      </BaseItem>
      {!isEmpty(maintainers) && (
        <BaseItem>
          <ItemLabel>{t('MAINTAINER_COLON')}</ItemLabel>
          <ItemValue>{maintainers.join('、')}</ItemValue>
        </BaseItem>
      )}
      {!isEmpty(sources) && (
        <BaseItem>
          <ItemLabel>{t('SOURCE_CODE_ADDRESS_COLON')}</ItemLabel>
          <div>
            {sources.map((item: any) => (
              <ItemValue key={item}>{item}</ItemValue>
            ))}
          </div>
        </BaseItem>
      )}
    </AppBaseWrapper>
  );
}

export default AppBase;
