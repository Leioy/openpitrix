import React from 'react';
import { Field } from '@kubed/components';

import { showOutSiteLink } from '@ks-console/shared';

type Props = {
  name: string;
  isv?: string;
  home?: string;
  versionName?: string;
};

function BaseInfo({ name, home, versionName, isv }: Props): JSX.Element {
  return (
    <>
      <div style={{ marginRight: '40px', minWidth: '200px' }}>
        <Field className="mb8" value={name || '-'} label={t('APP_STORE_FIELD_NAME')} />
        <Field
          className="mb8"
          value={
            !home ? (
              <span>-</span>
            ) : (
              <>
                {showOutSiteLink() && (
                  <a href="" target="_blank" rel="noopener noreferrer">
                    {/* {hrefControl(url)} */}
                    {home}
                  </a>
                )}
              </>
            )
          }
          label={t('APP_STORE_SERVICE_PROVIDER_WEBSITE')}
        />
      </div>
      <div>
        <Field className="mb8" value={versionName || '-'} label={t('APP_STORE_VERSION')} />
        <Field className="mb8" value={isv || '-'} label={t('APP_STORE_FIELD_WORKSPACE')} />
      </div>
    </>
  );
}

export default BaseInfo;
