import React from 'react';
import { ClusterTitle, FormattedCluster } from '@ks-console/shared';
import { Card, Field, Row } from '@kubed/components';
import { StyledCol } from './styles';

interface Props {
  cluster: FormattedCluster;
}

function ClusterCard({ cluster }: Props) {
  return (
    <Card className="mb12">
      <Row>
        <StyledCol span={6}>
          <ClusterTitle width="100%" cluster={cluster} />
        </StyledCol>
        <StyledCol span={3}>
          <Field label={t('KUBERNETES_VERSION')} value={cluster.kubernetesVersion}></Field>
        </StyledCol>
        <StyledCol span={3}>
          <Field label={t('PROVIDER')} value={cluster.provider || '-'}></Field>
        </StyledCol>
      </Row>
    </Card>
  );
}

export default ClusterCard;
