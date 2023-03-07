import React, { ChangeEvent, useState } from 'react';
import { useStore } from '@kubed/stook';
import { Magnifier } from '@kubed/icons';
import { getQuery } from '@ks-console/shared';
import { useNavigate } from 'react-router-dom';

import { CountDesc, SearchInput, ToolBarContent, ToolBarWrapper } from './styles';

function Toolbar(): JSX.Element {
  const navigate = useNavigate();
  const [total] = useStore<number>('currentCategoryAppsTotal');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const { category, keyword } = getQuery<{ category: string; keyword: string }>();

  function handleInputChange({ target }: ChangeEvent<HTMLInputElement>): void {
    setSearchKeyword(target.value);
  }

  function handleSearch(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      e.stopPropagation();
      e.preventDefault();

      let queries = [];

      if (category) {
        queries.push(`category=${category}`);
      }

      if (searchKeyword) {
        queries.push(`keyword=${searchKeyword}`);
      } else if (keyword) {
        queries.push(`keyword=${searchKeyword}`);
      }

      navigate(`${location.pathname}?${queries.join('&')}`);
    }
  }

  return (
    <ToolBarWrapper>
      <ToolBarContent>
        <CountDesc>{t(`TOTAL_CATE_COUNT`, { total })}</CountDesc>
        <SearchInput
          prefix={<Magnifier />}
          placeholder={t('SEARCH_BY_NAME')}
          onKeyDown={handleSearch}
          onChange={handleInputChange}
        />
      </ToolBarContent>
    </ToolBarWrapper>
  );
}

export default Toolbar;
