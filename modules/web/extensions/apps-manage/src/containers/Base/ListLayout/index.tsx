import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Openpitrix } from '@kubed/icons';
import { Outlet, useLocation } from 'react-router-dom';
import { navs as navMenus } from './contants';
import { NavMenu, NavTitle, useGlobalStore, ListPageSide } from '@ks-console/shared';

const PageMain = styled.div`
  margin-left: 240px;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
`;

const NAV_KEY = 'MANAGE_APP_NAVS';

const PREFIX = '/apps-manage';
function ListLayout(): JSX.Element {
  const location = useLocation();
  const { getNav, setNav } = useGlobalStore();
  let navs = getNav(NAV_KEY);

  useEffect(() => {
    if (!navs?.length) {
      // @ts-ignore
      setNav(NAV_KEY, navMenus);
    }
  }, []);

  return (
    <>
      <ListPageSide>
        <NavTitle
          icon={<Openpitrix variant="light" size={40} />}
          title={t('APP_STORE_MANAGEMENT')}
          subtitle={t('APP_STORE_MANAGEMENT_DESC')}
          style={{ marginBottom: '20px' }}
        />
        {navs && <NavMenu navs={navs} prefix={PREFIX} pathname={location.pathname} />}
      </ListPageSide>
      <PageMain>
        <Outlet />
      </PageMain>
    </>
  );
}

export default ListLayout;
