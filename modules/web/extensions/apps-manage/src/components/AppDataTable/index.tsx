import React, { ReactNode, useMemo } from 'react';

import { Column, DataTable, openpitrixStore, useListQueryParams } from '@ks-console/shared';

const { getBaseUrl, SORT_KEY } = openpitrixStore;

type Props = {
  workspace?: string;
  tableRef?: any;
  filter?: boolean;
  columns: Column[];
  categoryName?: string;
  batchActions?: ReactNode[] | null;
  toolbarRight?: ReactNode[] | null;
  emptyOptions?: any;
};

function AppDataTable({
  columns,
  categoryName,
  batchActions,
  toolbarRight,
  tableRef,
  workspace,
  emptyOptions,
}: Props): JSX.Element {
  const queryParams: Record<string, unknown> = useMemo(() => {
    return {
      category_id: categoryName,
      order: SORT_KEY,
      status: 'active|rejected|passed|suspended|draft',
      // repo_id: 'repo-helm',
    };
  }, [categoryName]);

  const requestParamsTransformer = (params: Record<string, any>) => {
    const { parameters, pageIndex, pageSize, filters } = params;
    const keyword = filters?.[0]?.value;
    const formattedParams: Record<string, any> = useListQueryParams({
      ...parameters,
    });
    const querys: Record<string, string | number> = {
      ...formattedParams,
      page: pageIndex + 1,
      limit: pageSize,
      conditions: `status=${parameters.status}`,
    };
    if (categoryName) {
      querys.label = `application.kubesphere.io/app-category-name=${categoryName}`;
    }

    if (keyword) {
      querys.name = keyword;
    }

    return querys;
  };

  const formatServerData = (serverData: any) => {
    return {
      ...serverData,
      totalItems: serverData.totalItems,
    };
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
      format={data => data}
      batchActions={batchActions}
      toolbarRight={toolbarRight}
      serverDataFormat={formatServerData}
      transformRequestParams={requestParamsTransformer}
      emptyOptions={emptyOptions}
    />
  );
}

export default AppDataTable;
