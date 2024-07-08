import React, { useState } from 'react';
import { Drawer } from '@kubed/components';
import { useParams } from 'react-router-dom';

import { Icon, type ApplicationsInstanceDetail } from '@ks-console/shared';

import AppDetails from './AppDetails';
import AppsContent from './AppsContent';

import { CloseModal } from './styles';

type Props = {
  visible: boolean;
  onCancel: () => void;
  openDeployModal: (appDetail: ApplicationsInstanceDetail, versionID: string) => void;
};

function CreateOPAppWithTemplatesModal({ visible, onCancel, openDeployModal }: Props): JSX.Element {
  const { workspace } = useParams();
  const [viewType, setViewType] = useState<string>('appList');
  const [currentApp, setCurrentApp] = useState<ApplicationsInstanceDetail>(
    {} as ApplicationsInstanceDetail,
  );
  const [currentRepo] = useState<any>();

  const handleAppItemClick = (appItem: ApplicationsInstanceDetail, view: string): void => {
    setCurrentApp(appItem);
    setViewType(view);
  };

  function handleClick(versionID: string, yamlTemplate?: string) {
    openDeployModal(
      {
        ...currentApp,
        'all.yaml': yamlTemplate,
      },
      versionID,
    );
  }
  return (
    <Drawer
      maskClosable
      width={1070}
      placement="right"
      visible={visible}
      onClose={onCancel}
      contentWrapperStyle={{ backgroundColor: '#f9fbfd' }}
    >
      <CloseModal color="dark" shadow onClick={onCancel}>
        <Icon name="close" size={24} color="white" />
      </CloseModal>
      {viewType === 'appList' && (
        // @ts-ignore TODO
        <AppsContent workspace={workspace} repo={currentRepo} onItemClick={handleAppItemClick} />
      )}
      {viewType === 'appDetail' && (
        <AppDetails
          workspace={workspace}
          detail={currentApp}
          setViewType={setViewType}
          onAppInstall={handleClick}
        />
      )}
    </Drawer>
  );
}

export default CreateOPAppWithTemplatesModal;
