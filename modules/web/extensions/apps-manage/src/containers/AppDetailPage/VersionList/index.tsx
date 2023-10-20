import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import { VersionList } from '@ks-console/shared';
import CreateHelmApp from '../../AppCreate/CreateHelmApp';
import { updateVersion } from '../../../stores';

function VersionLists() {
  const [visible, setVisible] = useState(false);
  const { appName = '' } = useParams();

  function handleCreate(data: any) {
    updateVersion({ app_name: appName }, data);
  }
  return (
    <>
      <VersionList onAddVersion={() => setVisible(true)} />
      <CreateHelmApp visible={visible} onCancel={() => setVisible(false)} onOk={handleCreate} />
    </>
  );
}

export default VersionLists;
