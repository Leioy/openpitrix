import React from 'react';
import { RuleObject } from 'rc-field-form/lib/interface';
import { Form, FormItem, Input, Modal, useForm } from '@kubed/components';

import { CategoryDetail, Icon } from '@ks-console/shared';

import IconSelector from './IconSelector';

type Props = {
  visible: boolean;
  detail?: CategoryDetail;
  categoryNames: string[];
  onOk?: (data: Pick<CategoryDetail, 'metadata' | 'spec'>) => void;
  onCancel: () => void;
};

function ManageCategoryModal({
  visible,
  detail,
  categoryNames,
  onOk,
  onCancel,
}: Props): JSX.Element {
  const [form] = useForm();

  const defaultVal = {
    name: detail?.spec.displayName.zh,
  };

  const nameValidator = (rule: RuleObject, value: string, callback: any) => {
    if (!value) {
      return callback();
    }

    if (value !== detail?.metadata.name && categoryNames.includes(value)) {
      return callback(t('NAME_EXIST_DESC'));
    }

    callback();
  };

  function handleOK(): void {
    form.validateFields().then(res => {
      const params = {
        apiVersion: 'application.kubesphere.io/v2',
        kind: 'Category',
        metadata: {
          name: detail?.metadata.name || res.name,
        },
        spec: {
          // description: {
          //   en: 'database1',
          //   zh: 'database1',
          // },
          displayName: {
            en: res.name,
            zh: res.name,
          },
        },
      } as unknown as Pick<CategoryDetail, 'metadata' | 'spec'>;
      if (onOk) {
        onOk(params);
      }
    });
  }

  return (
    <Modal
      visible={visible}
      title={t('CATEGORY')}
      titleIcon={<Icon name="tag" size={20} />}
      onOk={handleOK}
      onCancel={onCancel}
    >
      <Form form={form} initialValues={defaultVal}>
        <FormItem
          name={['name']}
          label={t('NAME')}
          help={t('CATEGORY_NAME_DESC')}
          rules={[
            { required: true, message: t('ENTER_CATEGORY_NAME_TIP') },
            { validator: nameValidator },
          ]}
        >
          <Input autoComplete="off" maxLength={20} />
        </FormItem>
        <FormItem name={['description']} label={t('ICON')}>
          <IconSelector />
        </FormItem>
      </Form>
    </Modal>
  );
}

export default ManageCategoryModal;
