import React, { forwardRef, Ref, useEffect, useImperativeHandle, useState } from 'react';
import { isEmpty, merge } from 'lodash';
import { CodeEditor } from '@kubed/code-editor';
import { Alert, Form, Loading, Switch, useForm } from '@kubed/components';

import SchemaForm from './SchemaForm';
import { yaml, parser } from '@ks-console/shared';
import type { AppConfigDetail } from '@ks-console/shared';
import { useQueryFiles } from '../../../stores';
import { CodeEditorWrapper, Title } from './styles';

export type AppConfigRefType = {
  conf: string;
};

type Props = {
  appName?: string;
  versionId?: string;
  className?: string;
};

function AppConfigForm(
  { appName, versionId, className }: Props,
  ref?: Ref<AppConfigRefType>,
): JSX.Element {
  const [form] = useForm();
  const [isCodeMode, setIsCodeMode] = useState(false);
  const { data: files, isLoading } = useQueryFiles(
    { name: appName, version_id: versionId },
    { enabled: !!appName && !!versionId },
  );
  const [config, setConfig] = useState<AppConfigDetail>({
    valuesYaml: '',
    valuesJSON: {},
    valuesSchema: undefined,
  });

  function handleModeChange(): void {
    setIsCodeMode(!isCodeMode);
  }

  function handleYamlChange(value: any): void {
    setConfig((prevState: any) => ({ ...prevState, valuesYaml: value }));
  }

  function handleValuesJsonChange(patchJson: any): void {
    setConfig(prevState => {
      const finalValuesJson = merge(prevState, { valuesJSON: patchJson });
      return finalValuesJson;
    });
  }

  useEffect(() => {
    const value = Object.values(files || {});
    console.log(44443, value);
    if (isLoading || isEmpty(files)) return;

    if (value.length) {
      const [file] = value;
      setConfig({
        valuesYaml: file,
        valuesJSON: yaml.load(file),
        valuesSchema: parser.safeParseJSON(files['values.schema.json']),
      });
    }
  }, [files, isLoading]);

  useImperativeHandle(ref, () => {
    const { valuesYaml, valuesJSON, valuesSchema } = config;
    const finalConfig = yaml.getValue(
      isCodeMode || !valuesSchema ? yaml.load(valuesYaml) : valuesJSON,
    );

    return { conf: finalConfig };
  });

  if (isLoading) {
    return <Loading className="page-loading" />;
  }

  return (
    <div className={className}>
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
          <CodeEditor
            mode="yaml"
            value={config.valuesYaml}
            onChange={handleYamlChange}
            hasUpload={false}
            hasDownload={false}
          />
        </CodeEditorWrapper>
      ) : (
        <Form form={form} onValuesChange={handleValuesJsonChange}>
          <SchemaForm propObj={config.valuesSchema} />
        </Form>
      )}
    </div>
  );
}

export default forwardRef(AppConfigForm);
