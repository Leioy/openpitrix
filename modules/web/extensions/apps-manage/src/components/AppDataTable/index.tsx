import React, { ReactNode, useMemo } from 'react';
import { Appcenter } from '@kubed/icons';

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
};

function AppDataTable({
  columns,
  categoryId,
  batchActions,
  toolbarRight,
  tableRef,
  filter,
  workspace,
}: Props): JSX.Element {
  const queryParams: Record<string, unknown> = useMemo(() => {
    return {
      category_id: categoryId,
      order: SORT_KEY,
      status: 'active|rejected|passed|suspended|draft',
      // repo_id: 'repo-helm',
    };
  }, [categoryId]);

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
      conditions: formattedParams.conditions + `,keyword=${keyword}`,
      // TODO 参数问题
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
      format={data => data}
      batchActions={batchActions}
      toolbarRight={toolbarRight}
      serverDataFormat={formatServerData}
      transformRequestParams={requestParamsTransformer}
      emptyOptions={{
        withoutTable: true,
        image: <Appcenter size={48} />,
        title: t('NO_APP_DESC_FOUND'),
        description: t('APP_CATEGORY_EMPTY_DESC'),
      }}
    />
  );
}

export default AppDataTable;
