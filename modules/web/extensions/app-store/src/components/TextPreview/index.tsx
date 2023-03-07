import React, { useMemo, useState } from 'react';
import { Field } from '@kubed/components';
import { CodeEditor, CodeEditorProps } from '@kubed/code-editor';
import { Icon, saveFileAs, yamlSafeLoad } from '@ks-console/shared';

import { getDefaultSelectFile } from '../../utils';

import {
  EditorWrapper,
  FileSelector,
  OverlayTools,
  TextPreviewWrapper,
  ToolbarWrapper,
} from './styles';

type Props = {
  files: Record<string, string>;
  type?: string;
  hideToolbar?: boolean;
  hideOverlayBtns?: boolean;
  editorOptions?: Partial<CodeEditorProps>;
};

function TextPreview({
  files,
  type = 'selectFiles',
  editorOptions,
  hideToolbar = false,
  hideOverlayBtns = false,
}: Props): JSX.Element {
  const [mode] = useState<string>('yaml');
  const fileOptions = useMemo(
    () =>
      Object.keys(files).map(fileName => ({
        label: fileName,
        value: fileName,
      })),
    [files],
  );
  const [selectFile, setSelectFile] = useState<any>(getDefaultSelectFile(files, fileOptions));

  function saveFile(text: string, fileName: string): void {
    const blob = new Blob([text], {
      type: 'text/plain;charset=utf-8',
    });

    saveFileAs(blob, fileName);
  }

  function downloadAsJSON(text: string): void {
    const fileName = selectFile.replace(/yaml$/, 'json');
    let valuesData: any = '';
    try {
      valuesData = JSON.stringify(yamlSafeLoad(text), null, 2);
    } catch (e) {
      valuesData = e;
    }
    saveFileAs(valuesData, fileName);
  }

  function downloadAsYaml(text: string): void {
    // const selectFileName = this.state.selectFile
    saveFile(text, selectFile);
  }

  function handleDownload(): void {
    const sourceInYaml = files[selectFile];
    if (mode === 'yaml') {
      downloadAsYaml(sourceInYaml);
    } else if (mode === 'json') {
      downloadAsJSON(sourceInYaml);
    }
  }

  if (!selectFile) {
    return <p>{t('NO_APP_CHART_FILE_FOUND')}</p>;
  }

  return (
    <TextPreviewWrapper>
      {!hideToolbar && (
        <>
          {type === 'selectFiles' && (
            <ToolbarWrapper>
              <Field avatar={<Icon name="coding" size={20} />} value={t('CHART_FILES')} />
              <FileSelector
                defaultValue={selectFile}
                onChange={setSelectFile}
                options={fileOptions}
              />
            </ToolbarWrapper>
          )}
          {type === 'values.yaml' && (
            <Field avatar={<img src="/assets/helm.svg" alt="" />} value="Values.yaml" />
          )}
        </>
      )}
      <EditorWrapper>
        {!hideOverlayBtns && (
          <OverlayTools onClick={handleDownload}>
            <Icon name="download" size={20} variant="white" />
          </OverlayTools>
        )}
        <CodeEditor mode={mode} value={files[selectFile]} {...editorOptions} />
      </EditorWrapper>
    </TextPreviewWrapper>
  );
}

export default TextPreview;
