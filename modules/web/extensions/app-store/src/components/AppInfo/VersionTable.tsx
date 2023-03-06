import { formatTime } from '@ks-console/shared';
import React from 'react';

type Props = {
  versions: LatestAppVersion[];
};

function VersionTable({ versions }: Props): JSX.Element {
  return (
    <table className="versions">
      <thead>
        <tr>
          <th>{t('VERSION_NUMBER')}</th>
          <th>{t('UPDATE_LOG')}</th>
        </tr>
      </thead>

      <tbody>
        {versions.map(({ name, description, status_time, version_id }) => (
          <tr key={version_id}>
            <td>
              <p className="name">{name}</p>
              <p className="date">{formatTime(status_time, 'YYYY-MM-DD')}</p>
            </td>
            <td>
              <p className="desc">{description || '-'}</p>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default VersionTable;
