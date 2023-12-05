import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Openpitrix } from '@kubed/icons';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { navs as navMenus } from './contants';
import { NavMenu, NavTitle, useGlobalStore, permissionStore } from '@ks-console/shared';

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
const { getProjectNavs, getWorkspaceNavs } = permissionStore();

function ListLayout(): JSX.Element {
  const location = useLocation();
  const { workspace, namespace, cluster } = useParams();
  const navKey = namespace ? 'PROJECT_NAV' : workspace ? `WORKSPACE_NAV-${workspace}` : NAV_KEY;
  const { getNav, setNav } = useGlobalStore();
  let navs = getNav(navKey);
  const [prefix, setPrefix] = useState('/apps-manage');
  const [title, setTitle] = useState('APP_STORE_MANAGEMENT');
  const [subTitle, setSubTitle] = useState('');

  useEffect(() => {
    if (namespace) {
      navs = getProjectNavs({ cluster, workspace, project: namespace });
      setNav(navKey, navs);
      setPrefix(`/${workspace}/clusters/${cluster}/projects/${namespace}`);
      setTitle(namespace);
      setSubTitle(t('PROJECT'));
    } else if (workspace) {
      navs = getWorkspaceNavs(workspace);
      setNav(navKey, navs);
      setPrefix(`/workspaces/${workspace}`);
      setTitle(workspace);
      setSubTitle(t('WORKSPACE'));
    } else {
      setNav(NAV_KEY, navMenus);
      setPrefix('/apps-manage');
      setTitle(t('APP_STORE_MANAGEMENT'));
      setSubTitle(t('APP_STORE_MANAGEMENT_DESC'));
    }
  }, [workspace, namespace, cluster]);

  return (
    <>
      <PageSide>
        <NavTitle
          icon={<Openpitrix variant="light" size={40} />}
          title={t(title)}
          subtitle={subTitle}
          style={{ marginBottom: '20px' }}
        />
        {navs && <NavMenu navs={navs} prefix={prefix} pathname={location.pathname} />}
      </PageSide>
      <PageMain>
        <Outlet />
      </PageMain>
    </>
  );
}

export default ListLayout;
