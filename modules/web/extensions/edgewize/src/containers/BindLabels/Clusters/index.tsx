import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { isEmpty } from 'lodash';
import { Cluster } from '@kubed/icons';
import { Card, Switch, notify, Loading } from '@kubed/components';
import { FormattedCluster, isMultiCluster, workspaceStore, clusterStore } from '@ks-console/shared';
import ClusterCard from './Card';
import { editWorkspaceLabels } from '../../../stores';
import { EmptyWrapper } from './styles';

const { useFetchWorkspaceQuery } = workspaceStore;
const { useQueryWorkspaceClusters } = clusterStore;
function Clusters() {
  const { workspace = '' } = useParams<{ workspace: string }>();

  const { data: clusters, isLoading } = useQueryWorkspaceClusters(workspace);

  const edgeClusters = clusters?.filter(item => item.provider === 'EdgeWize');
  const [isEdgewize, setIsEdgewize] = useState(false);
  const { data: workspaces } = useFetchWorkspaceQuery({
    workspace,
  });

  async function fetch() {
    // @ts-ignore
    const labels = workspaces?.metadata?.labels?.['cluster-role.kubesphere.io/edge'];
    setIsEdgewize(!!labels);
  }

  useEffect(() => {
    if (workspaces) {
      fetch();
    }
  }, [workspaces]);

  function handleModeChange(val: boolean) {
    setIsEdgewize(val);
    let label: string[] = [];
    if (val && edgeClusters) {
      label = edgeClusters?.map((item: { name: string }) => item.name);
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

  if (isLoading) {
    return <Loading className="page-loading" />;
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
      {edgeClusters?.map((cluster: FormattedCluster) => (
        <ClusterCard key={cluster.name} cluster={cluster} />
      ))}
    </>
  );
}

export default Clusters;
