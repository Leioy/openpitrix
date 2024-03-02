import React, { useEffect, useMemo, useState } from 'react';
import { isEmpty } from 'lodash';
import { Col, FormInstance, FormItem, Input, Row, Select, Tag, Textarea } from '@kubed/components';
import {
  Pattern,
  openpitrixStore,
  compareVersion,
  generateId,
  isRadonDB,
} from '@ks-console/shared';
import type { AppDetail } from '@ks-console/shared';
import { useAppDetail, useAppVersionList } from '../../../../stores';
import { Title } from '../../styles';
import { BasicForm, OptionWrapper } from './styles';

const { fileStore } = openpitrixStore;

export type AppBasicInfoFormData = {
  name: string;
  versionID: string;
  description?: string;
};

type Props = {
  appName: string;
  versionID?: string;
  form: FormInstance<AppBasicInfoFormData>;
  versionStatus?: string;
  confirmedBasicData?: Partial<AppBasicInfoFormData>;
};

export function BasicInfoForm({
  appName,
  versionID: defaultVersionId,
  form,
  versionStatus,
  confirmedBasicData,
}: Props): JSX.Element {
  const [initData, setInitData] = useState<Partial<AppBasicInfoFormData>>();
  const { data: versions } = useAppVersionList({ appName }, { status: versionStatus });
  const sortedVersions = useMemo(
    () =>
      (versions || [])
        .map(version => ({
          label: version.spec.versionName,
          value: isRadonDB(appName) ? version.metadata.name : version.metadata.name,
        }))
        .sort((v1, v2) => compareVersion(v2.value, v1.value)),
    [versions],
  );
  const latestVersion: string = useMemo(() => sortedVersions[0]?.value, [sortedVersions]);

  const {} = useAppDetail(
    { name: appName },
    {
      enabled: !!appName,
      onSuccess: ({ metadata }: AppDetail) => {
        // TODO latest_app_version ?
        const { name } = metadata;
        if (!isEmpty(confirmedBasicData)) {
          return;
        }

        setInitData({
          // @ts-ignore TODO
          name: `${name.slice(0, 7).toLowerCase().replaceAll(' ', '-')}-${generateId()}`,
          // TODO latest_app_version.versionID?
          versionID: defaultVersionId || name,
        });
      },
    },
  );

  function handleVersionChange(versionID: string): void {
    fileStore
      .fetchAppFiles({ name: appName, versionID })
      .then(fileDetails => console.log(fileDetails));
  }

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
            name="versionID"
            rules={[{ required: true, message: t('VERSION_EMPTY_DESC') }]}
          >
            <Select style={{ width: '100%' }} onChange={handleVersionChange}>
              {sortedVersions.map(({ label, value }) => (
                <Select.Option key={value} value={value}>
                  <OptionWrapper>
                    <span>{label}</span>
                    {value === latestVersion && (
                      <Tag color="warning">{t('LATEST_VERSION_SCAP')}</Tag>
                    )}
                  </OptionWrapper>
                </Select.Option>
              ))}
            </Select>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span={6}>
          <FormItem label={t('DESCRIPTION')} name="description" help={t('DESCRIPTION_DESC')}>
            <Textarea maxLength={256} />
          </FormItem>
        </Col>
      </Row>
    </BasicForm>
  );
}
