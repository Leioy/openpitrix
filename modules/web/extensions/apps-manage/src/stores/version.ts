import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import { request, UseListInstance } from '@ks-console/shared';

import type { AppVersion } from '@ks-console/shared';

import { BaseUrlParams, getBaseUrl, useBaseList } from './base';

type VersionPathParams = { workspace?: string; app_name?: string };

const resourceName = 'versions';

const sortKey = 'sequence';

export const HANDLE_TYPE_TO_SHOW: Record<string, string> = {
  recover: 'activate',
};

export const DEFAULT_QUERY_VERSION_STATUS =
  'draft|submitted|rejected|in-review|passed|active|suspended';

export function useAppVersionList(
  { workspace, app_name }: VersionPathParams,
  params?: Record<string, any>,
  options?: any,
): UseListInstance<AppVersion> {
  const url = getBaseUrl({ workspace, app_name }, resourceName);
  const formattedParams = {
    ...params,
    status: params?.status || DEFAULT_QUERY_VERSION_STATUS,
    order: params?.order || sortKey,
  };

  return useBaseList(
    url,
    {
      params: formattedParams,
      autoFetch: !!app_name,
      ...options,
    },
    resourceName,
  );
}

export function useVersionDetail(
  { app_name, version_id }: BaseUrlParams,
  options?: UseQueryOptions<any, Error>,
): UseQueryResult<AppVersion> {
  const url = getBaseUrl({ app_name, version_id }, resourceName);

  return useQuery(['apps', 'detail', app_name, version_id], () => request.get(url), {
    enabled: !!version_id && !!app_name,
    onSuccess: options?.onSuccess,
  });
}

export function createVersion({ app_name }: BaseUrlParams, data: any): Promise<any> {
  const url = getBaseUrl({ app_name }, resourceName);

  return request.post(url, data);
}

export function deleteVersion({
  workspace,
  app_name,
  version_id,
}: Omit<BaseUrlParams, 'name'>): Promise<any> {
  const url = getBaseUrl({ workspace, app_name, version_id }, resourceName);

  return request.delete(url);
}

export function updateVersion<T>({ app_name, version_id }: BaseUrlParams, data: T): Promise<any> {
  const url = getBaseUrl({ app_name, version_id }, resourceName);

  return request.post(url, data);
}

export function handleVersion({ app_name, version_id }: BaseUrlParams, data: any): Promise<any> {
  const url = getBaseUrl({ app_name, version_id, name: 'action' }, resourceName);

  return request.post(url, data);
}
