import React, { useEffect, useState } from 'react';
import { isEmpty, merge } from 'lodash';
import { CodeEditor } from '@kubed/code-editor';
import { getValue, getValueObj, parser } from '@ks-console/shared';
import { Alert, Form, Loading, Switch, useForm } from '@kubed/components';

import SchemaForm from './SchemaForm';
import { useQueryFiles } from '../../../store';

import { AppConfigWrapper, CodeEditorWrapper, Title } from './styles';

type Props = {
  patchFormData: (patch: Partial<DeployFormData>) => void;
  appId?: string;
  versionId?: string;
};

function AppConfig({ appId, versionId, patchFormData }: Props): JSX.Element {
  const [form] = useForm();
  const [isCodeMode, setIsCodeMode] = useState<boolean>(false);
  const { data: files, isLoading } = useQueryFiles(
    { app_id: appId, version_id: versionId },
    { enabled: !!appId && !!versionId },
  );
  const [config, setConfig] = useState<AppConfigDetail>({
    valuesYaml: '',
    valuesJSON: {},
    valuesSchema: undefined,
  });

  function handleModeChange(): void {
    setIsCodeMode(!isCodeMode);
  }

  function handleYamlChange(yaml: any): void {
    setConfig((prevState: any) => ({ ...prevState, valuesYaml: yaml }));
  }

  function handleValuesJsonChange(patchJson: any): void {
    setConfig(prevState => {
      const finalValuesJson = merge(prevState, { valuesJSON: patchJson });
      return finalValuesJson;
    });
  }

  useEffect(() => {
    if (isLoading || isEmpty(files)) return;

    if (files?.['values.yaml']) {
      setConfig({
        valuesYaml: files['values.yaml'],
        valuesJSON: getValueObj(files['values.yaml']),
        valuesSchema: parser.safeParseJSON(files['values.schema.json']),
      });
    }
  }, [files, isLoading]);

  useEffect(() => {
    const { valuesYaml, valuesJSON, valuesSchema } = config;
    const finalConfig = getValue(
      isCodeMode || !valuesSchema ? getValueObj(valuesYaml) : valuesJSON,
    );

    patchFormData({ conf: finalConfig });
  }, [config]);

  if (isLoading) {
    return <Loading className="page-loading" />;
  }

  return (
    <AppConfigWrapper>
      <Title>
        <span>{t('APP_SETTINGS')}</span>
        {config.valuesSchema && (
          <Switch
            label={t('EDIT_YAML')}
            variant="button"
            onChange={handleModeChange}
            checked={isCodeMode}
          />
        )}
      </Title>
      {config.valuesSchema && (
        <Alert className="mb12" type="info">
          {t('HELM_APP_SCHEMA_FORM_TIP')}
        </Alert>
      )}
      {isCodeMode || !config.valuesSchema ? (
        <CodeEditorWrapper>
          <CodeEditor mode="yaml" value={config.valuesYaml} onChange={handleYamlChange} />
        </CodeEditorWrapper>
      ) : (
        <Form form={form} onValuesChange={handleValuesJsonChange}>
          <SchemaForm propObj={config.valuesSchema} />
        </Form>
      )}
    </AppConfigWrapper>
  );
}

export default AppConfig;
