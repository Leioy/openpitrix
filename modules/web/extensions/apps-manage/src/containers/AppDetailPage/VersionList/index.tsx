import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import { VersionList } from '@ks-console/shared';
import CreateApp from '../../AppCreate';
import { updateVersion } from '../../../stores';

function VersionLists() {
  const [visible, setVisible] = useState(false);
  const { appName = '' } = useParams();
  const isAdmin = location.pathname.includes('apps-manage/store');

  function handleCreate(data: any) {
    updateVersion({ app_name: appName }, data);
  }
  return (
    <>
      <VersionList onAddVersion={() => setVisible(true)} isAdmin={isAdmin} />
      <CreateApp visible={visible} onCancel={() => setVisible(false)} onOk={handleCreate} />
    </>
  );
}

export default VersionLists;
