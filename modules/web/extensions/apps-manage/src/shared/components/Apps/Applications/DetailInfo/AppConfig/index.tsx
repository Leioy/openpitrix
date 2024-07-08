import React from 'react';
import { Card } from '@kubed/components';
import { CodeEditor } from '@kubed/code-editor';

import { useCacheStore as useStore, safeAtob } from '@ks-console/shared';

function AppConfig(): JSX.Element {
  const [appDetail] = useStore<any>('appDetail');
  return (
    <Card sectionTitle={t('APP_SETTINGS')}>
      <CodeEditor
        mode="yaml"
        style={{ height: 'calc(100vh - 240px)' }}
        value={safeAtob(appDetail.spec?.values || '')}
        hasUpload={false}
        hasDownload={false}
      />
    </Card>
  );
}

export default AppConfig;
