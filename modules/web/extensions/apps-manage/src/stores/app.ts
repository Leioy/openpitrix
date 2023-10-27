import { get } from 'lodash';
import { useMutation, useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import { UseListOptions, getBrowserLang, isMultiCluster, request } from '@ks-console/shared';
import type { PathParams, AppDetail } from '@ks-console/shared';

import { BaseUrlParams, defaultUrl, getBaseUrl, useBaseList } from './base';

const resourceName: string = 'apps';

export const DEFAULT_QUERY_STATUS = 'draft|active|suspended|passed';

export const STORE_QUERY_APP_STATUS = 'active|suspended';

function getDeployPath({ workspace, cluster, namespace }: PathParams, resName?: string): string {
  let path = '';
  const query = [];

  if (resName) {
    path += `/${resName}`;
  }
  if (isMultiCluster() && cluster) {
    query.push(`clusters=${cluster}`);
  }
  if (workspace) {
    query.push(`workspace=${workspace}`);
  }
  if (namespace) {
    query.push(`namespace=${namespace}`);
  }

  return `${path}?${query.join('&')}`;
}

export function useAppList(
  { workspace }: PathParams,
  options?: Partial<UseListOptions<AppDetail>>,
) {
  const url = getBaseUrl({ workspace }, resourceName);

  return useBaseList<AppDetail>(url, { format: data => data, ...options }, workspace, resourceName);
}

export function fetchAppDetail({ workspace, app_name }: BaseUrlParams): Promise<AppDetail> {
  const url = getBaseUrl({ workspace, app_name }, resourceName);

  return request.get(url);
}

export function useAppDetail(
  { workspace, name }: BaseUrlParams,
  options?: UseQueryOptions<any, Error>,
): UseQueryResult<AppDetail> {
  return useQuery(
    ['apps', 'detail', name],
    () => {
      return fetchAppDetail({ workspace, app_name: name }).then((result: Record<string, any>) => {
        // multi-languages
        const userLang = get(globals.user, 'lang') || getBrowserLang();

        return {
          ...result,
          workspace,
          abstraction: result[`abstraction_${userLang}`] || result.abstraction,
          screenshots: result[`screenshots_${userLang}`] || result.screenshots,
        };
      });
    },
    {
      enabled: options?.enabled || !!name,
      onSuccess: options?.onSuccess,
    },
  );
}

export function createApp({ workspace }: BaseUrlParams, data: any): Promise<any> {
  const url = getBaseUrl({ workspace }, resourceName);

  return request.post(url, data);
}

export function deleteApp({ workspace, app_name }: BaseUrlParams): Promise<void> {
  const url = getBaseUrl({ workspace, app_name }, resourceName);

  return request.delete(url);
}

export function updateApp(
  { workspace, app_name }: BaseUrlParams,
  data: Partial<AppDetail>,
): Promise<void> {
  const url = getBaseUrl({ workspace, app_name }, resourceName);

  return request.patch(url, data);
}

export async function deployApp(
  params: Record<string, any>,
  { workspace, namespace, cluster }: Record<string, any>,
): Promise<void> {
  if (namespace) {
    request.post(
      `${defaultUrl}${getDeployPath(
        {
          workspace,
          namespace,
          cluster,
        },
        'applications',
      )}`,
      params,
    );
  }
}

type UploadData = { type: string; attachment_content: string; sequence: number };

export function upload({ app_name, workspace }: BaseUrlParams, data: UploadData): Promise<any> {
  const url = getBaseUrl({ app_name, workspace }, resourceName);

  return request.patch(url, data);
}

type ScreenshotsMutateProps = {
  screenshots: string[];
  type: 'add' | 'delete';
  startIndex?: number;
};

export function useScreenShotsMutation(
  { metadata, workspace }: AppDetail,
  options?: Pick<UseQueryOptions<any>, 'onSuccess' | 'onError'>,
) {
  const { name } = metadata;
  return useMutation(
    ({ screenshots, type, startIndex = 0 }: ScreenshotsMutateProps) =>
      Promise.allSettled(
        screenshots.map(async (screenshotStr: string, index) => {
          const isDelete = type === 'delete';

          if (isDelete && index < startIndex) {
            return;
          }

          const uploadData: UploadData = {
            type: 'screenshot',
            attachment_content: isDelete ? '' : screenshotStr,
            sequence: isDelete ? index : startIndex + index,
          };

          return upload({ workspace, name }, uploadData);
        }),
      ),
    options,
  );
}

export function handleApp({ app_name, workspace }: BaseUrlParams, data: any): Promise<any> {
  const url = getBaseUrl({ app_name, workspace, name: 'action' }, resourceName);

  return request.post(url, data);
}
