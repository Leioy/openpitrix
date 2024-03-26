import React, { useMemo } from 'react';

import {
  CategoryDetail,
  Icon,
  isUnCategorizedCtg,
  getDetailMetadataCategory,
} from '@ks-console/shared';

import { Actions, Category, Others } from './styles';

type Props = {
  detail: CategoryDetail;
  isActive: boolean;
  onSelectCategory: (item: CategoryDetail) => void;
  onEditCategory?: (item: CategoryDetail) => void;
  onDeleteCategory?: (item: CategoryDetail) => void;
};

function CategoryItem({
  detail,
  isActive,
  onSelectCategory,
  onEditCategory,
  onDeleteCategory,
}: Props): JSX.Element {
  // @ts-ignore
  const icons = detail?.spec?.icon;
  const iconName = useMemo(() => {
    if (['uncategorized', ''].includes(icons || '')) {
      return 'tag';
    }
    return icons;
  }, [icons]);

  return (
    <Category onClick={() => onSelectCategory(detail)} className={`${isActive && 'active'}`}>
      {iconName && <Icon size={16} className="mr12" name={iconName} />}
      {getDetailMetadataCategory(detail as any)}
      <Others>
        <span className="total_count">{detail?.status.total || 0}</span>
        {!isUnCategorizedCtg(detail?.metadata.name) && (
          <Actions className="actions">
            <Icon
              name="trash"
              onClick={(e: any) => {
                e.preventDefault();
                e.stopPropagation();
                onDeleteCategory?.(detail);
              }}
            />
            <Icon
              name="pen"
              onClick={(e: any) => {
                e.preventDefault();
                e.stopPropagation();
                onEditCategory?.(detail);
              }}
            />
          </Actions>
        )}
      </Others>
    </Category>
  );
}

export default CategoryItem;
