import React, { ReactNode, useMemo } from 'react';

import { openpitrixStore, useListQueryParams, DataTable, Column } from '@ks-console/shared';

const { getBaseUrl, SORT_KEY } = openpitrixStore;

type Props = {
  workspace?: string;
  tableRef?: any;
  filter?: boolean;
  columns: Column[];
  categoryID?: string;
  batchActions?: ReactNode[] | null;
  toolbarRight?: ReactNode[] | null;
  emptyOptions?: any;
};

export function AppDataTable({
  columns,
  categoryID,
  batchActions,
  toolbarRight,
  tableRef,
  filter,
  workspace,
  emptyOptions,
}: Props): JSX.Element {
  const queryParams: Record<string, unknown> = useMemo(() => {
    const appType = workspace ? ',application.kubesphere.io/app-type in (helm,yaml)' : '';
    const otherQuery = {
      label: `application.kubesphere.io/repo-name=upload${appType}`,
    };
    return {
      categoryID,
      order: SORT_KEY,
      status: 'active|rejected|passed|suspended|draft',
      // repo_id: 'repo-helm',
      otherQuery,
    };
  }, [categoryID]);

  const requestParamsTransformer = (params: Record<string, any>) => {
    const { parameters, pageIndex, filters, pageSize } = params;
    const keyword = filters?.[0]?.value;
    const formattedParams: Record<string, any> = useListQueryParams({
      ...parameters,
      page: pageIndex + 1,
    });
    if (filter) {
      formattedParams.page = pageIndex + 1;
      formattedParams.limit = pageSize;
      delete formattedParams.paging;
    }

    if (!keyword) {
      return formattedParams;
    }

    return {
      ...formattedParams,
      conditions: formattedParams.conditions,
      name: keyword,
      limit: 20,
      page: pageIndex + 1,
    };
  };

  const formatServerData = (serverData: any) => {
    return serverData;
  };

  return (
    <DataTable
      ref={tableRef}
      simpleSearch
      tableName="APP"
      rowKey="metadata.name"
      url={getBaseUrl({ workspace }, 'apps')}
      columns={columns}
      parameters={queryParams}
      batchActions={batchActions}
      toolbarRight={toolbarRight}
      serverDataFormat={formatServerData}
      transformRequestParams={requestParamsTransformer}
      emptyOptions={emptyOptions}
    />
  );
}

export default AppDataTable;
