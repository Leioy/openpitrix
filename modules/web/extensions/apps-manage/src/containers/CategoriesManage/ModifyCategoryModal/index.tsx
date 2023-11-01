import React, { useState } from 'react';
import { get } from 'lodash';
import { Form, FormItem, Modal, useForm, Select } from '@kubed/components';

import { CategoryDetail, Icon, getBrowserLang } from '@ks-console/shared';

import { Body } from './styles';

type Props = {
  visible: boolean;
  categoryId: string;
  categories: CategoryDetail[];
  onOk?: (data: string) => void;
  onCancel: () => void;
};

function ModifyCategoryModal({
  visible,
  categoryId,
  categories,
  onOk,
  onCancel,
}: Props): JSX.Element {
  const [form] = useForm();

  const userLang = (get(globals.user, 'lang') || getBrowserLang()) as 'en' | 'zh';

  const [category, setCategoryId] = useState<string>(categoryId || '');

  const options =
    categories?.map(({ metadata, spec }) => ({
      label: spec?.displayName?.[userLang],
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
            <Select value={category} options={options} onChange={setCategoryId} />
          </FormItem>
        </Form>
      </Body>
    </Modal>
  );
}

export default ModifyCategoryModal;
