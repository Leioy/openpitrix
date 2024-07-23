import {
  Avatar,
  Column,
  getDisplayName,
  StatusReason,
  TableRef,
  workloadStore,
  Constants,
  getWorkloadStatus,
  openpitrixStore,
  DataTable,
  AppDetail,
  transformRequestParams,
} from '@ks-console/shared';
import { get, uniqBy } from 'lodash';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { SelectWrapper } from './styles';
import WorkloadStatus from '../../components/WorkloadStatus';
import { useEffect, useState } from 'react';
import { useStore } from '@kubed/stook';
import { useVersionList } from '../../stores';

const DEFAULT_ROW_KEY = 'uid';
const { useApplicationsList } = openpitrixStore;
const MODULE = 'deployments';

const EdgeInstances = () => {
  const { appName = '' } = useParams();
  const tableRef = React.useRef<TableRef>(null);
  const [cluster, setCluster] = React.useState<string>('');
  const [version, setVersion] = useState('');

  const transformProjectTableParams = React.useCallback(
    (params: unknown) => {
      const p = transformRequestParams(params as any);
      if (version) {
        return {
          ...p,
          labelSelector: `application.kubesphere.io/app-id=${appName},apps.edgewize.io/apptemplateversion=${version}`,
        };
      }
      return {
        ...p,
        labelSelector: `application.kubesphere.io/app-id=${appName}`,
      };
    },
    [appName, version],
  );
  const params = {
    cluster,
  };

  const [detail] = useStore<AppDetail>('selectedApp');
  const workspace = get(detail, 'metadata.labels["kubesphere.io/workspace"]');
  const { data: versions, isLoading: versionLoading } = useVersionList(workspace, appName);
  const versionList =
    versions?.map(item => ({
      label: get(item, 'spec.versionName'),
      value: get(item, 'spec.versionName'),
    })) ?? [];
  // @ts-ignore
  const getItemDesc = record => {
    const { status, reason } = getWorkloadStatus(record, MODULE);
    const desc = reason ? (
      <StatusReason status={status} reason={t(reason)} data={record} />
    ) : (
      record.description || '-'
    );

    return desc;
  };

  const columns: Column<any>[] = [
    {
      title: t('NAME'),
      field: 'name',
      id: 'name',
      sortable: true,
      searchable: true,
      render: (name, record) => {
        // const prefix = `/${this.workspace}/clusters/${this.cluster}/projects/${record.namespace}`;
        return (
          <Avatar
            icon={Constants.ICON_TYPES.deployments}
            iconSize={40}
            title={getDisplayName(record)}
            description={getItemDesc(record)}
            // to={`${prefix}/${module}/${name}`}
            isMultiCluster={record.isFedManaged}
          />
        );
      },
    },
    {
      title: t('STATUS'),
      field: 'status',
      id: 'status',
      canHide: true,
      width: '22%',
      render: (status, record) => <WorkloadStatus record={record} module={MODULE} />,
    },
    {
      title: t('VERSION'),
      field: 'version',
      id: 'version',
      canHide: true,
      render: (_, record) => get(record, 'labels["apps.edgewize.io/apptemplateversion"]') ?? '-',
    },
    {
      title: t('PROJECT'),
      field: 'namespace',
      canHide: true,
    },
    {
      title: t('APPSTORE_NODE_GROUP'),
      field: 'nodegroup',
      id: 'nodegroup',
      canHide: true,
      render: (_, record) => get(record, 'labels["apps.edgewize.io/nodegroup"]') ?? '-',
    },
    {
      title: t('EDGE_NODE'),
      field: 'edgeNode',
      id: 'edgeNode',
      canHide: true,
      render: (_, record) => get(record, 'labels["apps.edgewize.io/node"]') ?? '-',
    },
  ];

  const { data, isLoading } = useApplicationsList({ appName }, { appName });
  const clusterOptions = uniqBy(
    data?.map(item => ({
      label: get(item, 'metadata.labels.["kubesphere.io/cluster"]', ''),
      value: get(item, 'metadata.labels.["kubesphere.io/cluster"]', ''),
    })) ?? [],
    'value',
  );

  useEffect(() => {
    if (Array.isArray(clusterOptions) && clusterOptions.length && !cluster) {
      setCluster(clusterOptions[0].value);
    }
  }, [clusterOptions]);
  const table = React.useMemo(() => {
    return {
      ref: tableRef,
      tableName: `apps.${cluster}.${version}:table:list`,
      columns: columns as Column[],
      isLoading: isLoading,
      transformRequestParams: transformProjectTableParams,
      url: workloadStore(MODULE).getResourceUrl(params),
      parameters: { cluster, version },
    };
  }, [isLoading, cluster, version]);
  const toolbarLeft = (
    <>
      <SelectWrapper
        loading={isLoading}
        options={clusterOptions}
        value={cluster}
        onChange={setCluster}
      />
      <SelectWrapper
        loading={versionLoading}
        options={versionList}
        value={version}
        onChange={setVersion}
        allowClear
      />
    </>
  );
  return (
    <>
      {/*@ts-ignore*/}
      <DataTable
        key={table.tableName}
        rowKey={DEFAULT_ROW_KEY}
        toolbarLeft={toolbarLeft}
        placeholder={t('SEARCH_BY_NAME')}
        {...table}
        format={formatData => workloadStore(MODULE).mapper(formatData)}
        tableName={table.tableName}
        url={workloadStore(MODULE).getResourceUrl(params)}
      />
    </>
  );
};

export { EdgeInstances };
