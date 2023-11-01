import { PathParams } from '@ks-console/shared';
import { defaultUrl } from './base';

type ReviewsPathParams = PathParams & {
  app_name?: string;
  version_id?: string;
};

export function getReviewsUrl({ workspace, app_name }: ReviewsPathParams): string {
  let prefix = defaultUrl + '/reviews';
  if (app_name) {
    prefix += `/${app_name}`;
  }

  if (workspace) {
    prefix += `?workspaces=${workspace}`;
  }
  return `${prefix}`;
}
