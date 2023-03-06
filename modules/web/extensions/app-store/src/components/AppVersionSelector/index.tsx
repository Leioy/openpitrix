import React, { useEffect, useMemo } from 'react';
import { get, isEmpty } from 'lodash';
import { useStore } from '@kubed/stook';
import { Tag } from '@kubed/components';
import { formatTime } from '@ks-console/shared';

import { VersionSelector } from './styles';
import { LabelText } from '../AppInfo/styles';

type Props = {
  appDetail: AppDetail;
  versions: LatestAppVersion[];
};

function AppVersionSelector({ appDetail, versions }: Props): JSX.Element {
  const [selectedVersion, setSelectedVersion] = useStore<string>('selectedVersion');
  const versionOptions = useMemo(() => {
    return versions.map(({ version_id, name, create_time }) => ({
      label: name,
      description: formatTime(create_time, 'YYYY-MM-DD'),
      value: version_id,
    }));
  }, [versions]);
  const test = appDetail.keywords
    ?.split(',')
    .map((v: any) => v.trim())
    .filter(Boolean);

  function handleChangeAppVersion(versionId: string): void {
    setSelectedVersion(versionId);
  }

  useEffect(() => {
    const versionId = get(versions, '[0].version_id', '');
    setSelectedVersion(versionId);
  }, [versions]);

  return (
    <>
      <LabelText>{t('VERSIONS')}</LabelText>
      <VersionSelector
        options={versionOptions}
        value={selectedVersion}
        onChange={handleChangeAppVersion}
      />
      <LabelText>{t('KEYWORDS')}</LabelText>
      <div>
        {isEmpty(test) ? (
          t('NONE')
        ) : (
          <>
            {test?.map((v: any, index: number) => (
              <Tag key={`${v}_${index}`} type="secondary">
                {v}
              </Tag>
            ))}
          </>
        )}
      </div>
    </>
  );
}

export default AppVersionSelector;
