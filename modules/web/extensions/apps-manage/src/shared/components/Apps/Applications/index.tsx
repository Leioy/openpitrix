import React from 'react';
import { useCacheStore as useStore } from '@ks-console/shared';
import { Application } from '@kubed/icons';
import { Banner, BannerTip, Navs } from '@kubed/components';
import { useNavigate, useParams } from 'react-router-dom';

import { OPAppTable } from './AppTypeTable';
import type { OPAppTableProps } from './AppTypeTable';

export function Applications(props: OPAppTableProps): JSX.Element {
  const navigate = useNavigate();
  const { appType } = useParams();
  const [urlPrefix] = useStore('wujieUrlPrefix');
  const navs = [
    {
      value: 'template',
      label: t('APP_STORE_TEMPLATE_BASED_APP_PL'),
    },
  ];

  function handleNavChange(nav: string): void {
    console.log(111);
    navigate(`${urlPrefix}/applications/${nav}`);
  }

  return (
    <>
      <Banner
        className="mb12"
        icon={<Application />}
        title={t(`APP_PL`)}
        description={t('APPLICATIONS_DESC')}
      >
        <Navs value={appType} data={navs} onChange={handleNavChange} />
        <BannerTip title={t('APP_TYPES_Q')} key="app-type">
          {t('APP_TYPES_A')}
        </BannerTip>
      </Banner>
      <OPAppTable {...props} />
    </>
  );
}

export default Applications;
