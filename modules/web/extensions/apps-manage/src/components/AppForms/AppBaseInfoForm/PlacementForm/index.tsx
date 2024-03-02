import React, { Ref } from 'react';
import { Project } from '@kubed/icons';
import { Field } from '@kubed/components';
import { useParams } from 'react-router-dom';
import ConfigForm from './ConfigForm';
import type { AppPlacementConfigFormRef, AppPlacementFieldsData } from './ConfigForm';

import { Title } from '../../styles';
import { StaticPlacement, PlacementContent } from './styles';

export type { AppPlacementConfigFormRef, AppPlacementFieldsData } from './ConfigForm';

type Props = {
  formRef: Ref<AppPlacementConfigFormRef>;
  confirmedPlacementData?: Partial<AppPlacementFieldsData>;
};

export function PlacementForm({ formRef, confirmedPlacementData }: Props): JSX.Element {
  const { cluster, workspace, namespace } = useParams<'cluster' | 'workspace' | 'namespace'>();

  return (
    <>
      <Title>{t('LOCATION')}</Title>
      {namespace ? (
        <StaticPlacement>
          <PlacementContent>
            <Field label={t('WORKSPACE')} value={workspace || '-'} />
            <Field label={t('CLUSTER')} value={cluster || '-'} />
            <Field label={t('PROJECT')} value={namespace} avatar={<Project />} />
          </PlacementContent>
        </StaticPlacement>
      ) : (
        <ConfigForm
          ref={formRef}
          workspace={workspace}
          confirmedPlacementData={confirmedPlacementData}
        />
      )}
    </>
  );
}
