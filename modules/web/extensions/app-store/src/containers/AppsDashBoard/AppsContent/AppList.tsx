import React from 'react';
import { stringify } from 'qs';
import { getQuery } from '@ks-console/shared';

import AppCard from './AppCard';

import { AppItem, AppsWrapper, StyledLink } from './styles';

type Props = {
  apps: AppDetail[];
  isLoading?: boolean;
  disableLink?: boolean;
  itemClassName?: string;
  handleClickAppItem?: (app: AppDetail) => void;
};

function AppList({ apps, disableLink, handleClickAppItem, itemClassName }: Props): JSX.Element {
  const { workspace, namespace, cluster } = getQuery<{
    workspace: string;
    namespace: string;
    cluster: string;
  }>();
  const query = stringify({ workspace, cluster, namespace });

  return (
    <AppsWrapper>
      {apps.map(app => {
        if (!disableLink) {
          const link = `/apps/${app.app_id}?${query}`;

          return (
            <StyledLink key={app.app_id} className={itemClassName} to={link}>
              <AppCard app={app} />
            </StyledLink>
          );
        }

        return (
          <AppItem
            key={app.app_id}
            className={itemClassName}
            onClick={() => handleClickAppItem?.(app)}
          >
            <AppCard app={app} />
          </AppItem>
        );
      })}
    </AppsWrapper>
  );
}

export default AppList;
