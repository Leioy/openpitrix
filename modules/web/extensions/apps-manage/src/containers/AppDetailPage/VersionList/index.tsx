import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import { VersionList, CreateApp } from '@ks-console/shared';
import { updateVersion } from '../../../stores';

function VersionLists() {
  const [visible, setVisible] = useState(false);
  const { appName = '', workspace } = useParams();
  const isAdmin = location.pathname.includes('apps-manage/store');

  function handleCreate(data: any) {
    updateVersion({ app_name: appName }, data);
  }
  return (
    <>
      <VersionList onAddVersion={() => setVisible(true)} isAdmin={isAdmin} />
      <CreateApp
        isDetail
        appName={appName}
        visible={visible}
        onCancel={() => setVisible(false)}
        workspace={workspace}
        onOk={handleCreate}
      />
    </>
  );
}

export default VersionLists;
