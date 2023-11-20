import React, { ReactNode, useMemo } from 'react';

import { Column, DataTable, openpitrixStore, useListQueryParams } from '@ks-console/shared';

const { getBaseUrl, SORT_KEY } = openpitrixStore;

type Props = {
  workspace?: string;
  tableRef?: any;
  filter?: boolean;
  columns: Column[];
  categoryId?: string;
  batchActions?: ReactNode[] | null;
  toolbarRight?: ReactNode[] | null;
  emptyOptions?: any;
};

function AppDataTable({
  columns,
  categoryId,
  batchActions,
  toolbarRight,
  tableRef,
  workspace,
  emptyOptions,
}: Props): JSX.Element {
  const queryParams: Record<string, unknown> = useMemo(() => {
    return {
      category_id: categoryId,
      order: SORT_KEY,
      status: 'active',
      // repo_id: 'repo-helm',
    };
  }, [categoryId]);

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
    if (categoryId) {
      querys.label = `app.kubesphere.io/app-category-id=${categoryId}`;
    }

    if (keyword) {
      querys.conditions += `,keyword=${keyword}`;
    }

    return querys;
  };

  const formatServerData = (serverData: any) => {
    return {
      ...serverData,
      totalItems: serverData.total_count,
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
