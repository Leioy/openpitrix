import React, { ReactNode, useMemo } from 'react';
import { Appcenter } from '@kubed/icons';

import { Column, DataTable, openpitrixStore, useListQueryParams } from '@ks-console/shared';

const { getBaseUrl, SORT_KEY } = openpitrixStore;

type Props = {
  columns: Column[];
  categoryId?: string;
  batchActions?: ReactNode[] | null;
};

function AppDataTable({ columns, categoryId, batchActions }: Props): JSX.Element {
  const queryParams: Record<string, unknown> = useMemo(() => {
    return {
      category_id: categoryId,
      order: SORT_KEY,
      status: 'active',
      repo_id: 'repo-helm',
    };
  }, [categoryId]);

  const requestParamsTransformer = (params: Record<string, any>) => {
    const { parameters, pageIndex, filters } = params;
    const keyword = filters?.[0]?.value;
    const formattedParams: Record<string, any> = useListQueryParams({
      ...parameters,
      page: pageIndex + 1,
    });

    if (!keyword) {
      return formattedParams;
    }

    return {
      ...formattedParams,
      conditions: formattedParams.conditions + `,keyword=${keyword}`,
    };
  };

  const formatServerData = (serverData: any) => {
    return {
      ...serverData,
      totalItems: serverData.total_count,
    };
  };

  return (
    <DataTable
      simpleSearch
      tableName="APP"
      rowKey="app_id"
      url={getBaseUrl({}, 'apps')}
      columns={columns}
      parameters={queryParams}
      format={data => data}
      batchActions={batchActions}
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
