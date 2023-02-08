import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Toolbar from './Toolbar';
import Categories from './Categories';
import AppsContent from './AppsContent';
import { useQueryDataByResourceName } from '../../store';

import { PageMain } from './styles';
import { useStore } from '@kubed/stook';

function AppsDashBoard(): JSX.Element {
  const navigate = useNavigate();
  const appRef = useRef<any>();
  const [tabName, setTabName] = useState<string>(t('APP_CATE_ALL'));
  const [, setCurrentStep] = useStore<number>('currentStep');
  const ALL_CATEGORY_ITEM: CategoryDetail[] = [
    {
      category_id: 'all',
      name: t('ALL'),
      description: 'templet',
    },
  ];
  const { data: categories } = useQueryDataByResourceName<CategoryDetail>('categories', {
    noLimit: true,
  });
  const sideTabs = useMemo(
    () => (categories ? ALL_CATEGORY_ITEM.concat(categories) : []),
    [categories],
  );

  function handleClickCate(categoryKey: string, tabKey?: string): void {
    if (!tabKey) {
      return;
    }

    setTabName(
      t(`APP_CATE_${(tabKey || '').toUpperCase().replace(/[^A-Z]+/g, '_')}`, {
        defaultValue: tabKey,
      }),
    );

    navigate(`${location.pathname}?category=${categoryKey}`);
  }

  useEffect(() => {
    setCurrentStep(-2);
    navigate(`${location.pathname}?category=all`);
  }, []);

  return (
    <>
      <Toolbar />
      <PageMain>
        <Categories categories={sideTabs} handleCateClick={handleClickCate} />
        <AppsContent ref={appRef} title={tabName} />
      </PageMain>
    </>
  );
}

export default AppsDashBoard;
