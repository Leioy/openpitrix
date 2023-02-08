import React, { useMemo } from 'react';
import { ActionConfirm, Col, Form, FormItem, useForm } from '@kubed/components';

import { BorderRow, PlacementConfirm, SelectFormItem } from './styles';

type Props = {
  formData: DeployFormData;
  workspaces: any[];
  clusters: any[];
  namespaces: any[];
  workspace?: string;
  onOk?: (data: any) => void;
  onCancel?: () => void;
  handleClusterChange?: (cluster: string) => void;
  handleWorkspaceChange?: (space: string) => void;
};

function PlacementForm({
  formData,
  workspaces,
  clusters,
  namespaces,
  workspace,
  onOk,
  onCancel,
  handleClusterChange,
  handleWorkspaceChange,
}: Props): JSX.Element {
  const [form] = useForm();
  const workspaceOptions = useMemo(() => {
    return workspaces
      ?.filter(item => item.name !== globals.config.systemWorkspace)
      .map(item => ({
        label: item.name,
        value: item.name,
      }));
  }, [workspaces]);
  const clusterOptions = useMemo(() => {
    return clusters.map((item: any) => ({
      label: item.metadata.name,
      value: item.metadata.name,
      disabled: !item.isReady,
      cluster: item,
    }));
  }, [clusters]);
  const namespaceOptions = useMemo(() => {
    return namespaces
      .filter((item: any) => item.status !== 'Terminating')
      .map((item: any) => ({
        label: item.name,
        value: item.name,
        disabled: item.isFedManaged,
        // isFedManaged: item.isFedManaged,
      }));
  }, [namespaces]);

  function handleSubmit(): void {
    form?.validateFields().then((fieldsValues: any) => {
      onOk?.(fieldsValues);
      onCancel?.();
    });
  }

  return (
    <>
      <Form form={form} initialValues={formData}>
        <BorderRow>
          <Col span={4}>
            <FormItem name="workspace" label={t('WORKSPACE')}>
              <SelectFormItem
                placeholder={t('WORKSPACE_EMPTY_DESC')}
                options={workspaceOptions}
                onChange={handleWorkspaceChange}
                // prefixIcon={<Enterprise />}
                disabled={!!workspace}
              />
            </FormItem>
          </Col>
          <Col span={4}>
            <FormItem name="cluster" label={t('CLUSTER')}>
              <SelectFormItem
                placeholder=" "
                options={clusterOptions}
                onChange={handleClusterChange}
                // prefixIcon={<Cluster />}
                // optionRenderer={this.clusterOptionRenderer}
              />
            </FormItem>
          </Col>
          <Col span={4}>
            <FormItem
              name="namespace"
              label={t('PROJECT')}
              rules={[{ required: true, message: t('PROJECT_NOT_SELECT_DESC') }]}
            >
              <SelectFormItem
                placeholder=" "
                options={namespaceOptions}
                // valueRenderer={this.projectOptionRenderer}
                // optionRenderer={this.projectOptionRenderer}
              />
            </FormItem>
          </Col>
        </BorderRow>
      </Form>
      <PlacementConfirm>
        <ActionConfirm visible={true} onOk={handleSubmit} onCancel={onCancel} />
      </PlacementConfirm>
    </>
  );
}

export default PlacementForm;
