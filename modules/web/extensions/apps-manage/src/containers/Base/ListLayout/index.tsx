import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Openpitrix } from '@kubed/icons';
import { Outlet, useLocation } from 'react-router-dom';

import { NavMenu, NavTitle, useGlobalStore } from '@ks-console/shared';

const PageSide = styled.div`
  position: fixed;
  top: 88px;
  padding: 0 20px 40px;
  width: 260px;
  z-index: 99;
`;

const PageMain = styled.div`
  margin-left: 240px;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
`;

const NAV_KEY = 'MANAGE_APP_NAVS';

function ListLayout(): JSX.Element {
  const location = useLocation();
  const { getNav, setNav } = useGlobalStore();
  let navs = getNav(NAV_KEY);

  useEffect(() => {
    if (!navs) {
      setNav(NAV_KEY, globals.config.manageAppNavs);
    }
  }, []);

  return (
    <>
      <PageSide>
        <NavTitle
          icon={<Openpitrix variant="light" size={40} />}
          title={t('APP_STORE_MANAGEMENT')}
          style={{ marginBottom: '20px' }}
        />
        {navs && <NavMenu navs={navs} prefix="/apps-manage" pathname={location.pathname} />}
      </PageSide>
      <PageMain>
        <Outlet />
      </PageMain>
    </>
  );
}

export default ListLayout;
