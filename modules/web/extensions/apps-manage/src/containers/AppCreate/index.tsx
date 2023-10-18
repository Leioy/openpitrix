import React, { useState } from 'react';
import { Button, Collapse, Modal, notify } from '@kubed/components';

import { getWebsiteUrl, showOutSiteLink, openpitrixStore } from '@ks-console/shared';

import { Desc, Header, HeaderFieldItem, Logo, Note, StyledCollapse } from './styles';
import { CreateHelmApp } from './CreateHelmApp';
import { CreateYamlApp } from './CreateYamlApp';
import { CreateTemplateApp } from './CreateTemplateApp';

type Props = {
  visible?: boolean;
  onUpload?: () => void;
  onCancel?: () => void;
};

type ModalType = 'create_helm' | 'create_yaml' | 'create_template';

const { createApp } = openpitrixStore;

export function CreateApp({ visible, onCancel }: Props): JSX.Element {
  const { url } = getWebsiteUrl();
  // TODO: htmlLinkControl
  const htmlDesc = t('APP_CREATE_GUIDE', { docUrl: url });
  const [modalType, setModalType] = useState<ModalType>('create_helm');
  const [modalVisible, setModalVisible] = useState(false);

  function hanldleBtn(type: ModalType) {
    setModalType(type);
    setModalVisible(!modalVisible);
  }

  async function handleCreate(fileData: any): Promise<void> {
    await createApp({}, fileData);
    notify.success(t('UPLOAD_SUCCESSFUL'));
    setModalVisible(false);
    // tableRef.current?.refetch();
    // closeModal();
  }

  function renderModal() {
    if (modalType === 'create_helm') {
      return (
        <CreateHelmApp
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={handleCreate}
        />
      );
    }
    if (modalType === 'create_yaml') {
      return (
        <CreateYamlApp
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={handleCreate}
        />
      );
    }
    return (
      <CreateTemplateApp
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleCreate}
      />
    );
  }

  return (
    <>
      <Modal
        width={600}
        onCancel={onCancel}
        visible={visible}
        header={null}
        closable={false}
        footer={<Button onClick={onCancel}>{t('CANCEL')}</Button>}
      >
        <Header>
          <Logo src="/assets/application.svg" alt="" />
          <HeaderFieldItem value={t('CREATE_APP')} label={t('CREATE_APP_DESC')} />
        </Header>
        <StyledCollapse accordion defaultActiveKey="helm">
          <Collapse.Panel key="helm" header={t('UPLOAD_HELM_TITLE')}>
            <Desc>{t('HELM_CHART_FORMAT_DESC')}</Desc>
            <Button onClick={() => hanldleBtn('create_helm')} color="secondary" className="mt12">
              {t('UPLOAD')}
            </Button>
            {showOutSiteLink() && (
              <Note>
                💁‍♂️ <span dangerouslySetInnerHTML={{ __html: htmlDesc }} />
              </Note>
            )}
          </Collapse.Panel>
        </StyledCollapse>
        <StyledCollapse accordion defaultActiveKey="yaml">
          <Collapse.Panel key="helm" header={t('CREATE_YAML_APPS')}>
            <Button onClick={() => hanldleBtn('create_yaml')} color="secondary" className="mt12">
              {t('CREATE')}
            </Button>
            {showOutSiteLink() && (
              <Note>
                💁‍♂️ <span dangerouslySetInnerHTML={{ __html: htmlDesc }} />
              </Note>
            )}
          </Collapse.Panel>
        </StyledCollapse>
        <StyledCollapse accordion defaultActiveKey="template">
          <Collapse.Panel key="helm" header={t('CREATE_TEMPLATE_APPS')}>
            <Button
              onClick={() => hanldleBtn('create_template')}
              color="secondary"
              className="mt12"
            >
              {t('CREATE')}
            </Button>
            {showOutSiteLink() && (
              <Note>
                💁‍♂️ <span dangerouslySetInnerHTML={{ __html: htmlDesc }} />
              </Note>
            )}
          </Collapse.Panel>
        </StyledCollapse>
      </Modal>
      {renderModal()}
    </>
  );
}

export default CreateApp;
