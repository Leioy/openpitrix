import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Enterprise } from '@kubed/icons';
import { useModal } from '@kubed/components';

import type { FormattedWorkspace } from '@ks-console/shared';
import {
  NavMenu,
  NavTitle,
  useGlobalStore,
  workspaceStore,
  permissionStore,
} from '@ks-console/shared';
import WorkspaceSelectorModal from '../../WorkspaceSelectorModal';

const { useFetchWorkspaceQuery } = workspaceStore;

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

const navKey = 'WORKSPACE_NAV';

function ListLayout(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams<'workspace' | 'cluster'>();
  const { workspace: workspaceName = '', cluster } = params;
  const { getNav, setNav } = useGlobalStore();
  const { getWorkspaceNavs } = permissionStore();
  let navs = getNav(`${navKey}-${workspaceName}`);
  const modal = useModal();

  const { workspaceDetail } = useFetchWorkspaceQuery({
    workspace: workspaceName,
    cluster,
    enabled: Boolean(workspaceName),
  });

  const handleSelect = (modalId: string, formattedWorkspace: FormattedWorkspace) => {
    navigate(`/workspaces/${formattedWorkspace.name}/overview`);
    modal.close(modalId);
  };

  const openWorkspaceSelector = () => {
    const modalId = modal.open({
      titleIcon: <Enterprise size={40} />,
      title: t('WORKSPACE_PL'),
      description: t('WORKSPACE_DESC'),
      footer: null,
      width: 960,
      content: (
        <WorkspaceSelectorModal
          onSelect={formattedWorkspace => handleSelect(modalId, formattedWorkspace)}
        />
      ),
    });
  };

  useEffect(() => {
    if (!navs) {
      navs = getWorkspaceNavs(workspaceName);
      setNav(`${navKey}-${workspaceName}`, navs);
    }
  }, []);

  return (
    <>
      <PageSide>
        <NavTitle
          icon={<Enterprise variant="light" size={40} />}
          title={workspaceName}
          subtitle={workspaceDetail?.description || t('WORKSPACE')}
          style={{ marginBottom: '20px' }}
          onClick={openWorkspaceSelector}
        />
        <NavMenu navs={navs} prefix={`/workspaces/${workspaceName}`} pathname={location.pathname} />
      </PageSide>
      <PageMain>
        <Outlet />
      </PageMain>
    </>
  );
}

export default ListLayout;
