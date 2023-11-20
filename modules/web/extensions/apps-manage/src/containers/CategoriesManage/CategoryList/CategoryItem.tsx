import React, { useMemo } from 'react';

import { CategoryDetail, getBrowserLang, Icon, isUnCategorizedCtg } from '@ks-console/shared';

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
  const displayName = detail?.spec?.displayName?.[getBrowserLang()];
  const iconName = useMemo(() => {
    if (['uncategorized', ''].includes(detail?.spec?.description?.[getBrowserLang()] || '')) {
      return 'tag';
    }

    return displayName;
  }, [displayName]);

  return (
    <Category onClick={() => onSelectCategory(detail)} className={`${isActive && 'active'}`}>
      {iconName && <Icon size={16} className="mr12" name={iconName} />}
      {t(`APP_CATE_${displayName?.toUpperCase().replace(/[^A-Z]+/g, '_')}`, {
        defaultValue: displayName,
      })}
      <Others>
        <span className="total_count">{detail?.status.total || 0}</span>
        {!isUnCategorizedCtg(detail?.metadata.name) && (
          <Actions className="actions">
            <Icon
              name="trash"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                onDeleteCategory?.(detail);
              }}
            />
            <Icon
              name="pen"
              onClick={e => {
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
