import React, { useState } from 'react';
import { Form, FormItem, Modal, useForm, Select } from '@kubed/components';

import { CategoryDetail, Icon, getAnnotationsName } from '@ks-console/shared';

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
    categories?.map(({ metadata }) => ({
      label: t(
        `APP_CATE_${getAnnotationsName({ metadata }, 'kubesphere.io/alias-name')
          ?.toUpperCase()
          .replace(/[^A-Z]+/g, '_')}`,
        {
          defaultValue:
            getAnnotationsName({ metadata }, 'kubesphere.io/alias-name') ||
            (metadata.name === 'kubesphere-app-uncategorized' ? '未分类' : metadata.name),
        },
      ),
      value: metadata.name,
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
      title={t('MODIFY_CATEGORY')}
      titleIcon={<Icon name="tag" size={20} />}
      onOk={handleOK}
      onCancel={onCancel}
    >
      <Body>
        <Form form={form} initialValues={{ category }}>
          <FormItem
            name={['category']}
            label={t('MODIFY_CATEGORY')}
            help={t('MODIFY_CATEGORY_HELP')}
            rules={[{ required: true, message: t('MODIFY_CATEGORY_REQUIRED') }]}
          >
            <Select value={category} options={options} onChange={setcategoryName} />
          </FormItem>
        </Form>
      </Body>
    </Modal>
  );
}

export default ModifyCategoryModal;
