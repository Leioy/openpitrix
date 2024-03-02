import React, { Ref, forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { omit } from 'lodash';
import { FormItem, useForm } from '@kubed/components';
import { RuleObject, ValidateFields } from 'rc-field-form/lib/interface';

import PlacementField from './PlacementField';
import ConfigEditItems from './ConfigEditItems';
import { projectStore, workspaceStore } from '@ks-console/shared';
import type { ValidNamespace } from '@ks-console/shared';

import { PlacementItemWrapper, StyledForm } from './styles';

export type AppPlacementFieldsData = {
  cluster?: string;
  workspace?: string;
  namespace?: string;
  placement?: AppPlacementFieldsData;
};

type AppConfirmedFormData = Omit<AppPlacementFieldsData, 'placement'>;

export type AppPlacementConfigFormRef = {
  formData: AppConfirmedFormData;
  validateFields: ValidateFields<AppPlacementFieldsData>;
};

interface Props {
  workspace?: string;
  confirmedPlacementData?: AppPlacementFieldsData;
}
const { useNamespaceList } = projectStore;
const { useWorkspaces, useFetchWorkspaceClustersQuery } = workspaceStore;

function PlacementConfigForm(
  { workspace, confirmedPlacementData }: Props,
  ref?: Ref<AppPlacementConfigFormRef>,
): JSX.Element {
  const [form] = useForm<AppPlacementFieldsData>();
  const [showForm, setShowForm] = useState<boolean>(false);
  const initFormConfirmedData = useMemo(
    () => ({
      ...confirmedPlacementData,
      workspace: workspace ?? confirmedPlacementData?.workspace,
      placement: {
        ...confirmedPlacementData,
        workspace: workspace ?? confirmedPlacementData?.workspace,
      },
    }),
    [workspace, confirmedPlacementData?.workspace],
  );
  const [confirmedFormData, setConfirmedFormData] =
    useState<AppPlacementFieldsData>(initFormConfirmedData);
  const { data: workspaces = [], isLoading: workspaceLoading } = useWorkspaces(
    { limit: -1, ascending: true },
    ({ items }) => {
      if (!form.getFieldValue('placement').workspace) {
        const patchWorkspaces = items?.filter(item => item.name !== globals.config.systemWorkspace);

        setConfirmedFormData(prev => {
          return {
            ...prev,
            workspace: patchWorkspaces?.[0].name || workspace,
            placement: { ...prev.placement, workspace: patchWorkspaces?.[0].name || workspace },
          };
        });
      }
    },
  );
  const { formattedClusters, refetch: refetchClusters } = useFetchWorkspaceClustersQuery({
    workspace: workspace ?? form.getFieldValue('workspace'),
  });
  const namespaceAutoFetch = useMemo(() => {
    return !workspaceLoading;
    // TODO  临时注释。由于环境问题 临时注释
    // return (
    //   (!!workspace ?? !!form.getFieldValue('workspace')) &&
    //   !!confirmedFormData?.cluster &&
    //   !workspaceLoading
    // );
  }, [workspace, workspaceLoading, form.getFieldValue('workspace'), confirmedFormData?.cluster]);
  const { data: namespaces = [], reFetch: refetchNamespace } = useNamespaceList(
    {
      workspace: workspace ?? form.getFieldValue('workspace'),
      cluster: confirmedFormData?.cluster,
      ascending: true,
    },
    {
      autoFetch: namespaceAutoFetch,
      onSuccess: ({ items }) => {
        if (!confirmedFormData?.namespace) {
          const filteredNamespace = items?.filter(item => item.status !== 'Terminating');

          if (filteredNamespace) {
            const filteredNamespacesOptions: ValidNamespace[] = filteredNamespace?.map(item => ({
              label: item.name,
              value: item.name,
              disabled: item.isFedManaged,
              isFedManaged: item.isFedManaged,
            }));
            const firstValidNamespace = filteredNamespacesOptions.find(item => !item.disabled);
            const patchData = {
              workspace: form.getFieldValue('workspace'),
              cluster: form.getFieldValue('cluster'),
              namespace: firstValidNamespace?.value ?? '',
            };

            setConfirmedFormData({
              ...patchData,
              placement: { ...patchData },
            });
          }
        }
      },
    },
  );

  const placementValidator = (
    rule: RuleObject,
    value: Record<string, unknown>,
    callback: (error?: any) => void,
  ) => {
    if (!value?.namespace) {
      return callback(t('PROJECT_NOT_SELECT_DESC'));
    }

    return callback();
  };

  const closePlacementForm = () => setShowForm(false);

  const handleFormValuesChange = (values: AppPlacementFieldsData) => {
    const changeFieldKey = Object.keys(values)[0];

    switch (changeFieldKey) {
      case 'workspace':
        form.setFieldValue('cluster', undefined);
        form.setFieldValue('namespace', undefined);
        break;
      case 'cluster':
        form.setFieldValue('namespace', undefined);
        break;
      default:
        break;
    }
  };

  const handleFormSubmit = (data: AppPlacementFieldsData) => {
    setConfirmedFormData({ ...data, placement: { ...data } });
    closePlacementForm();
  };

  useImperativeHandle(ref, () => ({
    formData: omit(confirmedFormData, 'placement'),
    validateFields: () =>
      form.validateFields().then(data => ({ ...omit(data, 'placement'), ...data.placement })),
  }));

  useEffect(() => {
    if (!workspaceLoading && !form.getFieldValue('cluster')) {
      const patchData = {
        workspace: form.getFieldValue('workspace'),
        cluster: formattedClusters[0].name,
      };

      setConfirmedFormData({
        ...patchData,
        placement: {
          ...patchData,
        },
      });
    }
  }, [workspaceLoading, formattedClusters]);

  useEffect(() => {
    setConfirmedFormData(initFormConfirmedData);
  }, [initFormConfirmedData]);

  useEffect(() => {
    form.resetFields();
  }, [confirmedFormData]);

  useEffect(() => {
    return closePlacementForm();
  }, []);

  return (
    <StyledForm
      form={form}
      initialValues={confirmedFormData}
      onValuesChange={handleFormValuesChange}
      onFinish={handleFormSubmit}
    >
      {showForm ? (
        <ConfigEditItems
          workspace={workspace}
          clusters={formattedClusters}
          workspaces={workspaces}
          namespaces={namespaces}
          refetchClusters={refetchClusters}
          refetchNamespaces={refetchNamespace}
          onConfirm={form.submit}
          onCancel={closePlacementForm}
        />
      ) : (
        <PlacementItemWrapper>
          <FormItem name={['placement']} rules={[{ validator: placementValidator }]}>
            <PlacementField
              initializing={workspaceLoading}
              showPlacementForm={() => setShowForm(true)}
            />
          </FormItem>
        </PlacementItemWrapper>
      )}
    </StyledForm>
  );
}

export default forwardRef(PlacementConfigForm);
