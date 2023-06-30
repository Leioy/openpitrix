import React, { useEffect, useMemo, useState } from 'react';

import { CategoryDetail, isUnCategorizedCtg } from '@ks-console/shared';

import CategoryItem from './CategoryItem';

import { CategoriesWrapper } from './styles';

type Props = {
  categories: CategoryDetail[];
  onSelectCategory: (data: CategoryDetail) => void;
  onManageCategory: (data: CategoryDetail, manageType: string) => void;
};

function CategoryList({ categories, onSelectCategory, onManageCategory }: Props): JSX.Element {
  const unCategorizedItem = useMemo(() => {
    return categories.find(({ category_id }) => isUnCategorizedCtg(category_id));
  }, [categories]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryDetail | undefined>(
    unCategorizedItem,
  );

  useEffect(() => setSelectedCategory(unCategorizedItem), [unCategorizedItem]);

  useEffect(() => {
    if (selectedCategory) {
      onSelectCategory(selectedCategory);
    }
  }, [selectedCategory]);

  return (
    <CategoriesWrapper>
      {categories?.map(item => (
        <CategoryItem
          key={item.category_id}
          detail={item}
          onSelectCategory={setSelectedCategory}
          isActive={item.category_id === selectedCategory?.category_id}
          onEditCategory={data => onManageCategory(data, 'manage')}
          onDeleteCategory={data => onManageCategory(data, 'delete')}
        />
      ))}
    </CategoriesWrapper>
  );
}

export default CategoryList;
