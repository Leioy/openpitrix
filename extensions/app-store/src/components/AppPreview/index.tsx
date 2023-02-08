import React, { useMemo } from 'react';
import { Loading } from '@kubed/components';
import ReactMarkDown from 'react-markdown';

import TextPreview from '../TextPreview';
import { useQueryFiles } from '../../store';

type Props = {
  appId: string;
  versionId: string;
  currentTab: string;
};

function AppPreview({ appId, versionId, currentTab }: Props): JSX.Element {
  const { data: files, isLoading } = useQueryFiles(
    { app_id: appId, version_id: versionId },
    { enabled: !!appId && !!versionId },
  );
  const readme = useMemo(() => files?.['README.md'], [files?.['README.md']]);

  if (isLoading) {
    return <Loading className="page-loading" />;
  }

  return (
    <>
      {currentTab === 'versionInfo' && (
        <>
          {readme ? (
            <ReactMarkDown>{readme}</ReactMarkDown>
          ) : (
            <p>{t('VERSION_INTRO_EMPTY_DESC')}</p>
          )}
        </>
      )}
      {currentTab === 'chartFiles' && files && (
        <TextPreview files={files} editorOptions={{ readOnly: true }} />
      )}
    </>
  );
}

export default AppPreview;
