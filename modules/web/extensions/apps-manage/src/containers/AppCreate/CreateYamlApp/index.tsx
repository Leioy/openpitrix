import React from 'react';
import { Form, FormItem, Input, useForm } from '@kubed/components';
import { CodeEditor } from '@kubed/code-editor';
import { Firewall } from '@kubed/icons';
import { safeBtoa } from '@ks-console/shared';

import { FlexBox, HeaderWrapper, ModalBody, ModalStyle, TitleWrapper } from './styles';

interface Props {
  visible: boolean;
  onCancel: () => void;
  onOk?: (data: any) => void;
}
export function CreateYamlApp(props: Props) {
  const { visible, onCancel, onOk } = props;
  const [form] = useForm();
  const initialValues = {
    app_type: 'yaml',
    package: '# 这里填写用 “---”分割的多个 yaml 文件',
  };

  function handleChange(val: string) {
    console.log(val);
  }

  function handleOk() {
    form.validateFields().then(() => {
      const data = form.getFieldsValue(true);
      data.package = safeBtoa(data.package);
      onOk?.(data);
    });
  }

  return (
    <ModalStyle
      title={t('CREATE_YAML_APPS')}
      titleIcon={<Firewall />}
      width={660}
      visible={visible}
      onCancel={onCancel}
      onOk={handleOk}
      header={null}
      closable={false}
    >
      <HeaderWrapper>
        <img src="/assets/project-create.svg" alt="" />
        <TitleWrapper>
          <div>{t('CREATE_YAML_APPS')}</div>
        </TitleWrapper>
      </HeaderWrapper>
      <ModalBody>
        <Form form={form} initialValues={initialValues} onFieldsChange={([]) => {}}>
          <FlexBox>
            <FormItem
              label={t('NAME')}
              help={t('PROJECT_NAME_DESC')}
              name={['name']}
              rules={[
                { required: true, message: t('NAME_EMPTY_DESC') },
                // {
                //   pattern: Pattern.PATTERN_SERVICE_NAME,
                //   message: t('PROJECT_NAME_INVALID_DESC'),
                // },
                // { validator: nameValidator },
              ]}
            >
              <Input maxLength={63} />
            </FormItem>
            <FormItem
              label={t('VERSION_NUMBER')}
              name={['version_name']}
              rules={[
                { required: true, message: t('VERSION_NUMBER') },
                // {
                //   pattern: Pattern.PATTERN_SERVICE_NAME,
                //   message: t('PROJECT_NAME_INVALID_DESC'),
                // },
                // { validator: nameValidator },
              ]}
            >
              <Input />
            </FormItem>
          </FlexBox>
          <FormItem
            label={t('YAML')}
            name={['package']}
            rules={[
              { required: true, message: t('YAML') },
              // {
              //   pattern: Pattern.PATTERN_SERVICE_NAME,
              //   message: t('PROJECT_NAME_INVALID_DESC'),
              // },
              // { validator: nameValidator },
            ]}
          >
            <CodeEditor
              mode="yaml"
              acceptFileTypes={['.yaml', '.yml']}
              fileName="config.yaml"
              readOnly={false}
              value={initialValues.package}
              onChange={handleChange}
            />
          </FormItem>
        </Form>
      </ModalBody>
    </ModalStyle>
  );
}

export default CreateYamlApp;
