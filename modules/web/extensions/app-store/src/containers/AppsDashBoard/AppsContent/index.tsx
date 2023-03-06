import React, { forwardRef, useEffect, useState } from 'react';
import { isEmpty } from 'lodash';
import { useStore } from '@kubed/stook';
import { Loading } from '@kubed/components';
import { getQuery } from '@ks-console/shared';

import AppList from './AppList';
import { getQueryListParams } from '../../../utils';
import { STORE_APP_LIMIT } from '../../../constants';
import { useQueryDataByResourceName } from '../../../store';

import { Title } from '../styles';
import { Desc, LoadMore, StyledEmpty, Wrapper } from './styles';

type Props = {
  title: string;
  className?: string;
};

function AppsContent({ title, className }: Props, ref?: any): JSX.Element {
  const { category, keyword } = getQuery<{ category: string; keyword: string }>();
  const appsQueryParams: QueryParams = {
    keyword,
    category_id: category,
    status: 'active',
    limit: STORE_APP_LIMIT,
  };
  const [keepPrevious, setKeepPrevious] = useState<boolean>(false);
  const [appList, setAppList] = useState<AppDetail[]>([]);
  const { isLoading, total, page, reFetch } = useQueryDataByResourceName<AppDetail>(
    'apps',
    appsQueryParams,
    {
      autoFetch: false,
      onSuccess: ({ items }: any) => {
        if (!keepPrevious) {
          return setAppList(items);
        }

        setAppList(prev => [...prev, ...items]);
        setKeepPrevious(false);
      },
    },
  );
  const [, setCurrentCategoryAppsTotal] = useStore<number>('currentCategoryAppsTotal');

  function refetchListByParams(patchParam: Partial<QueryParams>): void {
    const queryParams: QueryListParams = getQueryListParams('apps', {
      ...appsQueryParams,
      ...patchParam,
    });

    reFetch(queryParams);
  }

  function handleShowMore(): void {
    refetchListByParams({ page: page + 1 });
    setKeepPrevious(true);
  }

  useEffect(() => {
    if (!category && !keyword) return;

    const patchParam: Partial<QueryParams> = {};

    if (category) {
      patchParam.category_id = category;
    }

    if (keyword) {
      patchParam.keyword = keyword;
    }

    refetchListByParams(patchParam);
  }, [category, keyword]);

  useEffect(() => {
    if (!total) {
      return;
    }

    setCurrentCategoryAppsTotal(total);
  }, [total]);

  return (
    <Wrapper className={className} ref={ref}>
      {title && <Title style={{ marginBottom: '20px' }}>{title}</Title>}
      {isLoading && <Loading className="page-loading" />}
      {!isLoading && isEmpty(appList) && (
        <StyledEmpty>
          <img src="/assets/empty-card.svg" alt="" />
          <Desc>{t('NO_RESOURCE_FOUND')}</Desc>
        </StyledEmpty>
      )}
      {!isLoading && !isEmpty(appList) && <AppList apps={appList} />}
      {!isLoading && appList.length < total && (
        <LoadMore onClick={handleShowMore}>{t('VIEW_MORE')}</LoadMore>
      )}
    </Wrapper>
  );
}

export default forwardRef(AppsContent);
