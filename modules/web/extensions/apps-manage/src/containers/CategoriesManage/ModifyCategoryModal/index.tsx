import React, { useState } from 'react';
import { Form, FormItem, Modal, useForm, Select } from '@kubed/components';

import { CategoryDetail, Icon, getDetailMetadataCategory } from '@ks-console/shared';

import { Body } from './styles';

type Props = {
  visible: boolean;
  categoryName: string;
  categories: CategoryDetail[];
  onOk?: (data: string) => void;
  onCancel: () => void;
};

function ModifyCategoryModal({
  visible,
  categoryName,
  categories,
  onOk,
  onCancel,
}: Props): JSX.Element {
  const [form] = useForm();

  const [category, setcategoryName] = useState<string>(categoryName || '');

  const options =
    categories?.map(record => ({
      label: getDetailMetadataCategory(record as any),
      value: record.metadata?.name,
    })) ?? [];

  function handleOK(): void {
    form.validateFields().then(res => {
      if (onOk) {
        onOk(res.category);
      }
    });
  }

  return (
    <Modal
      visible={visible}
      title={t('APP_STORE_CHANGE_CATEGORY')}
      titleIcon={<Icon name="tag" size={20} />}
      onOk={handleOK}
      onCancel={onCancel}
    >
      <Body>
        <Form form={form} initialValues={{ category }}>
          <FormItem
            name={['category']}
            label={t('APP_STORE_CHANGE_CATEGORY')}
            help={t('APP_STORE_MODIFY_CATEGORY_HELP')}
            rules={[{ required: true, message: t('APP_STORE_MODIFY_CATEGORY_REQUIRED') }]}
          >
            <Select value={category} options={options} onChange={setcategoryName} />
          </FormItem>
        </Form>
      </Body>
    </Modal>
  );
}

export default ModifyCategoryModal;
