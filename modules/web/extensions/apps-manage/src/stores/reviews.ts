import { PathParams } from '@ks-console/shared';
import { defaultUrl } from './base';

type ReviewsPathParams = PathParams & {
  appName?: string;
  versionID?: string;
};

export function getReviewsUrl({ workspace, appName }: ReviewsPathParams): string {
  let prefix = defaultUrl + '/reviews';
  if (appName) {
    prefix += `/${appName}`;
  }

  if (workspace) {
    prefix += `?workspaces=${workspace}`;
  }
  return `${prefix}`;
}
