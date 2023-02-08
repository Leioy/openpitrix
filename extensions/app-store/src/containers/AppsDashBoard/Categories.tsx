import React, { forwardRef } from 'react';
import { getQuery } from '@ks-console/shared';

import { CATELATEST, uncateKey } from '../../constants';

import { CategoriesWrapper, MenuItem, Name, StyledGroup, StyledIcon, Title } from './styles';

type Props = {
  categories: CategoryDetail[];
  handleCateClick: (category: string, tabName?: string) => void;
};

function Categories({ categories = [], handleCateClick }: Props, ref: any): JSX.Element {
  const { category } = getQuery<{ category: string }>();

  return (
    <CategoriesWrapper ref={ref}>
      <Title>{t('DISCOVER')}</Title>
      <StyledGroup direction="column">
        <MenuItem
          key={CATELATEST}
          className={category === CATELATEST ? 'active' : undefined}
          onClick={() => handleCateClick(CATELATEST)}
        >
          <StyledIcon name="cart" size={16} />
          <Name>{t('NEW_APPS')}</Name>
        </MenuItem>
      </StyledGroup>
      <Title>{t('APP_CATEGORY_PL')}</Title>
      <StyledGroup direction="column">
        {categories?.map(({ category_id, name, description }: CategoryDetail, index: number) => (
          <MenuItem
            key={category_id || index}
            className={category === category_id ? 'active' : undefined}
            onClick={() => handleCateClick(category_id, name)}
          >
            <StyledIcon
              name={category_id === uncateKey ? 'tag' : description ?? ''}
              variant={category === category_id ? 'coloured' : 'dark'}
            />
            <Name>
              {t(`APP_CATE_${name.toUpperCase().replace(/[^A-Z]+/g, '_')}`, {
                defaultValue: name,
              })}
            </Name>
          </MenuItem>
        ))}
      </StyledGroup>
    </CategoriesWrapper>
  );
}

export default forwardRef(Categories);
