import React, { useEffect, useMemo, useState } from 'react';
import { isEmpty } from 'lodash';
import { Col, FormInstance, FormItem, Input, Row, Select, Tag, Textarea } from '@kubed/components';
import { Pattern, compareVersion, generateId, isRadonDB } from '@ks-console/shared';
import type { AppDetail } from '@ks-console/shared';
import { useAppDetail, useAppVersionList, fileStore } from '../../../stores';
import { Title } from '../styles';
import { BasicForm, OptionWrapper } from './styles';

export type AppAppTemplateBaseInfFormData = {
  name: string;
  version_id: string;
  description?: string;
};

type Props = {
  appName: string;
  versionId?: string;
  form: FormInstance<AppAppTemplateBaseInfFormData>;
  versionStatus?: string;
  confirmedBasicData?: Partial<AppAppTemplateBaseInfFormData>;
};

export function AppTemplateBaseInfForm({ form, confirmedBasicData }: Props): JSX.Element {
  const [initData, setInitData] = useState<Partial<AppAppTemplateBaseInfFormData>>();

  useEffect(() => form.setFieldsValue(initData ?? {}), [initData]);

  useEffect(() => {
    if (!isEmpty(confirmedBasicData)) {
      setInitData(confirmedBasicData);
    }
  }, [confirmedBasicData]);

  return (
    <BasicForm form={form}>
      <Title>{t('BASIC_INFORMATION')}</Title>
      <Row>
        <Col span={6}>
          <FormItem
            name="name"
            label={t('NAME')}
            help={t('CLUSTER_NAME_DESC')}
            rules={[
              { required: true, message: t('NAME_EMPTY_DESC') },
              {
                pattern: Pattern.PATTERN_SERVICE_NAME,
                message: t('INVALID_NAME_DESC', {
                  message: t('CLUSTER_NAME_DESC'),
                }),
              },
            ]}
          >
            <Input maxLength={53} />
          </FormItem>
        </Col>
        <Col span={6}>
          <FormItem
            label={t('VERSION')}
            name="version_id"
            rules={[{ required: true, message: t('VERSION_EMPTY_DESC') }]}
          >
            <Input maxLength={53} />
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span={6}>
          <FormItem label={t('DESCRIPTION')} name="description1" help={t('DESCRIPTION_DESC')}>
            <Textarea maxLength={256} />
          </FormItem>
          <FormItem label={t('DESCRIPTION')} name="description" help={t('DESCRIPTION_DESC')}>
            <Textarea maxLength={256} />
          </FormItem>
        </Col>
      </Row>
    </BasicForm>
  );
}
