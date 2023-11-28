import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { isEmpty } from 'lodash';
import { Cluster } from '@kubed/icons';
import { Card, Switch, notify } from '@kubed/components';
import { useStore } from '@kubed/stook';
import { FormattedCluster, isMultiCluster } from '@ks-console/shared';
import ClusterCard from './Card';
import { editWorkspaceLabels } from '../../../stores';
import { EmptyWrapper } from './styles';

function Clusters() {
  const { workspace } = useParams<{ workspace: string }>();
  const [clusters] = useStore('clusters');
  const [workspaces] = useStore('workspaces');
  console.log(123, workspaces);

  const edgeClusters = clusters?.filter(
    (item: { provider: string }) => item.provider === 'EdgeWize',
  );
  const labels = edgeClusters?.[0]?.labels?.['cluster-role.kubesphere.io/edge'];
  const [isEdgewize, setIsEdgewize] = useState(!!labels);

  function handleModeChange(val: boolean) {
    setIsEdgewize(val);
    let label = [];
    if (val) {
      label = edgeClusters.map((item: { name: string }) => item.name);
    }
    const params = [
      {
        op: 'add',
        path: '/metadata/labels',
        value: {
          'cluster-role.kubesphere.io/edge': label.join(','),
        },
      },
    ];
    editWorkspaceLabels(workspace as string, params).then(() => {
      notify.success(t('SETTING_OK'));
    });
  }
  if (!isMultiCluster()) {
    return null;
  }

  if (isEmpty(edgeClusters)) {
    return (
      <Card>
        <EmptyWrapper
          image={<Cluster size={48} />}
          title={t('NO_EDGEWIZE_CLUSTER_AVAILABLE')}
          description={t('WORKSPACE_NO_CLUSTER_TIP')}
        />
      </Card>
    );
  }

  return (
    <>
      <div>
        <Switch
          label={t('EDGEWIZE_WORKSPACE')}
          variant="button"
          onChange={handleModeChange}
          checked={isEdgewize}
        />
      </div>
      {edgeClusters.map((cluster: FormattedCluster) => (
        <ClusterCard key={cluster.name} cluster={cluster} />
      ))}
    </>
  );
}

export default Clusters;
