import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Enterprise } from '@kubed/icons';
import { Outlet, useLocation, useParams } from 'react-router-dom';

import {
  NavMenu,
  NavTitle,
  useGlobalStore,
  permissionStore,
  workspaceStore,
} from '@ks-console/shared';

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

const NAV_KEY = 'WORKSPACE_NAV';

const { useFetchWorkspaceQuery } = workspaceStore;
function ListLayout(): JSX.Element {
  const location = useLocation();
  const { workspace = '', cluster } = useParams();
  const { getWorkspaceNavs } = permissionStore();
  const keys = `${NAV_KEY}-${workspace}`;
  const { getNav, setNav } = useGlobalStore();
  let navs = getNav(keys);

  const { workspaceDetail } = useFetchWorkspaceQuery({
    workspace,
    cluster,
    enabled: Boolean(workspace),
  });

  useEffect(() => {
    if (!navs) {
      navs = getWorkspaceNavs(workspace);
      setNav(keys, navs);
    }
  }, []);
  return (
    <>
      <PageSide>
        <NavTitle
          icon={<Enterprise variant="light" size={40} />}
          title={workspace}
          subtitle={workspaceDetail?.description || t('WORKSPACE')}
          style={{ marginBottom: '20px' }}
        />
        {navs && (
          <NavMenu navs={navs} prefix={`/workspaces/${workspace}`} pathname={location.pathname} />
        )}
      </PageSide>
      <PageMain>
        <Outlet />
      </PageMain>
    </>
  );
}

export default ListLayout;
