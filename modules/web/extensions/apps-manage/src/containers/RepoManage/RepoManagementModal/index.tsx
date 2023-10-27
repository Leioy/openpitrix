import React, { useMemo, useState } from 'react';
import { get } from 'lodash';
import { Firewall } from '@kubed/icons';
import { useParams } from 'react-router-dom';
import { RuleObject } from 'rc-field-form/lib/interface';
import { FormItem, Input, Modal, useForm, Textarea } from '@kubed/components';

import UrlInput from '../../../components/UrlInput';
import TimeInput from '../../../components/TimeInput';
import { useRepoMutation } from '../../../stores';
import type { RepoData } from '../../../types/repo';
import { StyledForm } from './styles';

type Props = {
  visible: boolean;
  detail?: RepoData;
  onOk?: () => void;
  onCancel?: () => void;
};

function RepoManagementModal({ visible, detail, onCancel, onOk }: Props): JSX.Element {
  const [form] = useForm();
  const { workspace = '' } = useParams();

  const getType = useMemo(() => {
    let type = 'https';
    if (detail && detail.spec.url) {
      const matches = detail.spec.url.match(/^(.*):\/\//);
      if (matches?.[1]) {
        type = matches[1];
      }
    }
    return type;
  }, []);

  function getFormData(data: any) {
    return {
      apiVersion: 'application.kubesphere.io/v2',
      kind: 'HelmRepo',
      ...data,
      metadata: {
        ...data?.metadata,
        name: data?.metadata.name || '',
      },
      spec: {
        ...data?.spec,
        name: data?.spec.name || '',
        syncPeriod: get(data?.spec, 'syncPeriod', 0),
        url: data?.spec.url || '',
      },
    };
  }

  const initFormData = getFormData(detail);

  const urlFormData = {
    url: detail?.spec.url,
    credential: '{}',
    type: getType,
  };
  const [currentFormData, setCurrentFormData] = useState<RepoData>(initFormData);
  const { mutate, isLoading } = useRepoMutation(workspace, {
    onSuccess: () => onOk?.(),
  });

  function timeValidator(rule: RuleObject, value: string, callback: (error?: string) => void) {
    const data = +value;
    const time = /^[0-9]*$/;

    if (!data) {
      return callback();
    }

    if (!time.test(data.toString())) {
      return callback(t('SYNC_INTERVAL_INVALID'));
    }

    if (data !== 0 && (data > 86400 || data < 180)) {
      return callback(t('SYNC_INTERVAL_TIP'));
    }

    callback();
  }

  function handleUrlChange(url: string): void {
    const forms = { ...currentFormData };
    forms.spec.url = url;
    setCurrentFormData(forms);
  }

  function handleValuesChange(values: any): void {
    setCurrentFormData(prevFormData => ({
      ...prevFormData,
      metadata: {
        ...prevFormData.metadata,
        ...values.metadata,
        name: prevFormData.metadata.name || values.spec.name,
      },
      spec: {
        ...prevFormData.spec,
        ...values.spec,
      },
    }));
  }

  function handleOk(): void {
    form.validateFields().then(() => {
      if (detail?.metadata.name) {
        return mutate({ params: currentFormData, repo_name: detail.metadata.name });
      }

      return mutate({ params: currentFormData });
    });
  }

  return (
    <Modal
      width={691}
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel}
      titleIcon={<Firewall size={20} />}
      title={detail ? 'EDIT_APP_REPO' : 'ADD_APP_REPO'}
      confirmLoading={isLoading}
    >
      <StyledForm form={form} initialValues={initFormData} onValuesChange={handleValuesChange}>
        <FormItem
          name={['spec', 'name']}
          label={t('NAME')}
          rules={[{ required: true, message: t('NAME_EMPTY_DESC') }]}
        >
          <Input autoFocus={true} />
        </FormItem>
        <UrlInput formData={urlFormData} onChange={handleUrlChange} isSubmitting={isLoading} />
        <FormItem
          name={['spec', 'syncPeriod']}
          label={t('SYNC_INTERVAL')}
          help={t('SYNC_INTERVAL_DESC')}
          rules={[
            { required: true, message: t('SYNC_PERIOD_EMPTY_DESC') },
            { validator: timeValidator },
          ]}
        >
          <TimeInput />
        </FormItem>
        <FormItem
          name={['spec', 'description']}
          label={t('DESCRIPTION')}
          help={t('DESCRIPTION_DESC')}
        >
          <Textarea maxLength={256} />
        </FormItem>
      </StyledForm>
    </Modal>
  );
}

export default RepoManagementModal;
