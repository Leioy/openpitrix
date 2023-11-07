import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Openpitrix } from '@kubed/icons';
import { Outlet, useLocation, useParams } from 'react-router-dom';

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
  const { workspace, namespace, cluster } = useParams();
  // const { getNav, setNav } = useGlobalStore();
  // let navs = getNav(NAV_KEY);
  const [prefix, setPrefix] = useState('/apps-manage');
  const [title, setTitle] = useState('APP_STORE_MANAGEMENT');
  const [subTitle, setSubTitle] = useState('');
  const [menus, setMenus] = useState([]);
  useEffect(() => {
    if (namespace) {
      setPrefix(`/${workspace}/clusters/${cluster}/projects/${namespace}`);
      setMenus(globals.config.projectNavs);
      setTitle(namespace);
      setSubTitle('企业空间');
    } else if (workspace) {
      setPrefix(`/workspaces/${workspace}`);
      setMenus(globals.config.workspaceNavs);
      setTitle(workspace);
      setSubTitle('项目');
    } else {
      setPrefix('/apps-manage');
      setMenus(globals.config.manageAppNavs);
    }
  }, [workspace, namespace, cluster]);

  console.log(123, workspace, namespace);
  // useEffect(() => {
  //   if (menus.length) {
  //     setNav(NAV_KEY, menus);
  //   }
  // }, [menus]);
  console.log(menus, prefix);

  return (
    <>
      <PageSide>
        <NavTitle
          icon={<Openpitrix variant="light" size={40} />}
          title={t(title)}
          subtitle={subTitle}
          style={{ marginBottom: '20px' }}
        />
        {menus.length && <NavMenu navs={menus} prefix={prefix} pathname={location.pathname} />}
      </PageSide>
      <PageMain>
        <Outlet />
      </PageMain>
    </>
  );
}

export default ListLayout;
