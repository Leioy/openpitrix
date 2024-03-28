import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CreateApp, VersionList, AppsDeploySpaceModal, openpitrixStore } from '@ks-console/shared';

const { updateVersion } = openpitrixStore;

export function NewVersionList() {
  const [visible, setVisible] = useState(false);
  const [deployVisible, setDeployVisible] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [selectRow, setSelectRow] = useState<any>();
  const { appName = '', workspace } = useParams();
  const [params, setParams] = useState({
    workspace: workspace,
    // 'workspace-name': '',
    cluster: '',
    namespace: '',
    appName,
  });
  const isAdmin = location.pathname.includes('apps-manage/store');
  function closeModal() {
    setDeployVisible(false);
  }

  async function refreshList() {
    setRefresh(false);
    setTimeout(() => {
      setRefresh(true);
    }, 300);
  }

  async function handleCreate(data: any) {
    setRefresh(false);
    data.maintainers = [{ name: globals.user.username }];
    await updateVersion({ workspace: params.workspace, appName: appName }, data);
    setRefresh(true);
  }
  function handleDeploy(data: any) {
    setSelectRow(data);
    setDeployVisible(true);
  }
  const actionKey = {
    appKey: 'app-templates',
    create: 'workspace-view-create-app-templates',
    delete: 'workspace-delete-app-templates',
  };

  return (
    <>
      <VersionList
        refresh={refresh}
        actionKey={actionKey}
        onAddVersion={data => {
          if (!params.workspace) {
            setParams({
              ...params,
              workspace: data?.metadata?.labels['application.kubesphere.io/workspace'],
            });
          }
          setVisible(true);
        }}
        isAdmin={isAdmin}
        handleDeploy={handleDeploy}
      />
      <CreateApp
        isDetail
        appName={appName}
        visible={visible}
        onCancel={() => setVisible(false)}
        workspace={params.workspace}
        onOk={handleCreate}
        refresh={refreshList}
      />
      <AppsDeploySpaceModal
        {...params}
        onCancel={closeModal}
        success={closeModal}
        visible={deployVisible}
        appName={appName as string}
        detail={selectRow}
        versionID={selectRow?.metadata.name}
      />
    </>
  );
}

export default NewVersionList;
