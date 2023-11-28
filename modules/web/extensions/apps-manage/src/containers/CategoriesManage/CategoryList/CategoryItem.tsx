import React, { useMemo } from 'react';

import { CategoryDetail, Icon, isUnCategorizedCtg } from '@ks-console/shared';

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
  const displayName = detail?.metadata?.name;
  // @ts-ignore
  const icons = detail?.spec?.icon;
  const iconName = useMemo(() => {
    if (['uncategorized', ''].includes(icons || '')) {
      return 'tag';
    }
    return icons;
  }, [icons]);

  function getName(name: string) {
    if (name === 'kubesphere-app-uncategorized') {
      return 'UNCATEGORIZED';
    }
    return name;
  }
  return (
    <Category onClick={() => onSelectCategory(detail)} className={`${isActive && 'active'}`}>
      {iconName && <Icon size={16} className="mr12" name={iconName} />}
      {t(
        `APP_CATE_${getName(displayName)
          ?.toUpperCase()
          .replace(/[^A-Z]+/g, '_')}`,
        {
          defaultValue: getName(displayName),
        },
      )}
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
