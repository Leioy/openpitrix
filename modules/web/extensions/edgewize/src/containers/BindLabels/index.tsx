import React from 'react';
import { Banner } from '@kubed/components';
import { Dashboard } from '@kubed/icons';
import { useParams } from 'react-router-dom';

import ClusterBaseInfo from './Clusters';

export default function Overview() {
  return (
    <>
      <Banner
        icon={<Dashboard />}
        title={t('EDGEWIZE_LABELS')}
        description={t('EDGEWIZE_LABELS_DESC')}
        className="mb12"
      ></Banner>
      <ClusterBaseInfo />
    </>
  );
}
