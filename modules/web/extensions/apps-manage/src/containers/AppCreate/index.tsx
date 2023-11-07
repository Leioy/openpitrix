import React, { useState, useEffect } from 'react';
import cx from 'classnames';
import { Button, Modal, notify } from '@kubed/components';

import { openpitrixStore, useV3action, Icon } from '@ks-console/shared';
import { Header, HeaderFieldItem, Logo, FieldItem } from './styles';
import { CreateHelmApp } from './CreateHelmApp';
import { CreateYamlApp } from './CreateYamlApp';

type Props = {
  visible?: boolean;
  onOk?: (data: any, params: any) => void;
  onCancel?: () => void;
  tableRef?: any;
  workspace?: string;
  isDetail?: boolean;
  appName?: string;
};

type ModalType = 'create_helm' | 'create_yaml' | 'create_edge';

const { createApp } = openpitrixStore;

export function CreateApp({
  visible,
  onCancel,
  tableRef,
  onOk,
  workspace,
  isDetail,
  appName,
}: Props): JSX.Element {
  const { open, render: RenderTemplate } = useV3action('app.template.create.v2');
  const [modalType, setModalType] = useState<ModalType>('create_helm');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    console.log(123, isDetail, visible, workspace);
    const appType = sessionStorage.getItem('app_type')?.split('=')?.[1];
    if (workspace && visible && isDetail) {
      hanldleBtn(`create_${appType}` as ModalType);
    }
  }, [workspace, visible, isDetail]);

  function hanldleBtn(type: ModalType) {
    if (type === 'create_edge') {
      open({
        v3Module: 'edgeStore',
        module: 'apptemplates',
        appName,
        workspace,
        v3StoreParams: {
          module: 'edgeappsets',
        },
        success: datas => {
          console.log(123, datas);
          notify.success(t('UPDATE_SUCCESSFUL'));
          setModalVisible(false);
          tableRef?.current?.refetch();
        },
        onCancel: () => {
          onCancel?.();
          setModalVisible(false);
        },
      });
      return;
    }

    setModalType(type);
    setModalVisible(!modalVisible);
  }

  async function handleCreate(fileData: any): Promise<void> {
    if (onOk) {
      onOk(fileData, { workspace });
      notify.success(t('UPLOAD_SUCCESSFUL'));

      setModalVisible(false);
      onCancel?.();
      tableRef.current?.refetch();
      return;
    }
    sessionStorage.removeItem('app_type');
    console.log(workspace);
    await createApp({ workspace }, fileData);
    notify.success(t('UPLOAD_SUCCESSFUL'));
    setModalVisible(false);
    onCancel?.();
    tableRef.current?.refetch();
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
    return <></>;
  }

  return (
    <>
      <Modal
        width={600}
        onCancel={onCancel}
        visible={visible && !isDetail}
        header={null}
        closable={false}
        footer={<Button onClick={onCancel}>{t('CANCEL')}</Button>}
      >
        <Header>
          <Logo src="/assets/application.svg" alt="" />
          <HeaderFieldItem value={t('CREATE_APP')} label={t('CREATE_APP_DESC')} />
        </Header>
        <div
          style={{ marginTop: 100 }}
          className={cx('item')}
          onClick={() => hanldleBtn('create_helm')}
        >
          <FieldItem
            value={t('UPLOAD_HELM_TITLE')}
            label={t('HELM_CHART_FORMAT_DESC')}
            avatar={<Icon name="templet" size={40} />}
          />
        </div>
        <div className={cx('item')} onClick={() => hanldleBtn('create_yaml')}>
          <FieldItem
            value={t('CREATE_YAML_APPS')}
            label={t('HELM_CHART_FORMAT_DESC')}
            avatar={<Icon name="templet" size={40} />}
          />
        </div>
        <div className={cx('item')} onClick={() => hanldleBtn('create_edge')}>
          <FieldItem
            value={t('create_edge_APPS')}
            label={t('HELM_CHART_FORMAT_DESC')}
            avatar={<Icon name="templet" size={40} />}
          />
        </div>
      </Modal>
      {renderModal()}
      {RenderTemplate?.()}
    </>
  );
}

export default CreateApp;
