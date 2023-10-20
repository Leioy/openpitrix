import React from 'react';
import { Project } from '@kubed/icons';
import { Field, Loading } from '@kubed/components';
import { Icon } from '@ks-console/shared';

import { PlacementWrapper, Wrapper } from './styles';

type Props = {
  showPlacementForm: () => void;
  initializing: boolean;
  value?: any;
  onChange?: (namespace: Record<string, any>) => void;
};

function PlacementField({ value = {}, showPlacementForm, initializing }: Props): JSX.Element {
  const { namespace, workspace, cluster } = value;

  const handleExpand = () => {
    if (initializing) return;

    showPlacementForm?.();
  };

  return (
    <PlacementWrapper className="expand" onClick={handleExpand}>
      {!namespace ? (
        <>{initializing ? <Loading /> : t('PROJECT_NOT_SELECT_DESC')}</>
      ) : (
        <Wrapper>
          <Field label={t('WORKSPACE')} value={workspace || '-'} />
          <Field label={t('CLUSTER')} value={cluster || '-'} />
          <Field avatar={<Project size={40} />} label={t('PROJECT')} value={namespace || '-'} />
          <Icon name="chevron-down" size={20} />
        </Wrapper>
      )}
    </PlacementWrapper>
  );
}

export default PlacementField;
