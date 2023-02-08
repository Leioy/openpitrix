import React from 'react';
import { isEmpty } from 'lodash';
import { Backup } from '@kubed/icons';
import { useStore } from '@kubed/stook';

import Image from '../Image';
import { isAppsPageExact } from '../../utils';

import {
  Inner,
  Shape1,
  Shape2,
  Shape3,
  Shape4,
  Content,
  BackLink,
  LeftShape1,
  LeftShape2,
  AppOutLine,
  BannerWrapper,
  WhiteField,
} from './styles';

type Props = {
  onBack: () => void;
};

function Banner({ onBack }: Props): JSX.Element {
  const isAppsPage = isAppsPageExact();
  const [appDetail] = useStore<AppDetail>('appDetail');

  return (
    <BannerWrapper>
      <Inner>
        <Content>
          <Shape1 />
          <Shape2 />
          <Shape3 />
          {isAppsPage ? (
            <>
              <LeftShape1 className="leftShape_1" />
              <LeftShape2 className="leftShape_2" />
            </>
          ) : (
            <>
              <Shape4 />
              <AppOutLine>
                <BackLink onClick={onBack}>
                  <Backup size={20} className="mr12" />
                  {t('BACK')}
                </BackLink>
                {!isEmpty(appDetail) && (
                  <WhiteField
                    avatar={
                      <Image
                        iconSize={48}
                        src={appDetail.icon}
                        iconLetter={appDetail.name}
                        alt=""
                      />
                    }
                    label={appDetail.description || '-'}
                    value={appDetail.name || '-'}
                  />
                )}
              </AppOutLine>
            </>
          )}
        </Content>
      </Inner>
    </BannerWrapper>
  );
}

export default Banner;
