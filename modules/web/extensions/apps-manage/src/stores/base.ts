import {
  isMultiCluster,
  PathParams,
  useUrl,
  useList,
  UseListOptions,
  UseListInstance,
  useListQueryParams,
  UseQueryParamsOption,
} from '@ks-console/shared';

export const { getPath } = useUrl({ module: '' });

export const MAX_LIMIT = 200;

export const SORT_KEY = 'create_time';

export const STATUS = [];

export const STORE_APP_LIMIT = 12;

export const STORE_QUERY_STATUS = 'active|suspended';

export const APP_STORE_ACTIONS = ['suspend', 'recover'];

export const REVIEW_QUERY_STATUS: Record<string, string> = {
  all: 'active|rejected|passed|submitted|suspended',
  processed: 'active|rejected|passed|suspended',
  unprocessed: 'submitted',
};

export const defaultUrl = 'kapis/application.kubesphere.io/v2';

export type BaseUrlParams = {
  workspace?: string;
  app_id?: string;
  versionID?: string;
  appName?: string;
  name?: string;
};

export function getBaseUrl(
  { workspace, app_id, versionID, appName, name }: BaseUrlParams,
  resourceName: string,
): string {
  let prefix = defaultUrl;
  if (versionID) {
    const suffix = resourceName === 'versions' ? '' : resourceName;
    return `${prefix}/apps/${appName}/versions/${versionID}/${name || suffix}`;
  }
  if (appName) {
    const suffix = (name && `/${name}`) || resourceName === 'apps' ? '' : `/${resourceName}`;
    return `${prefix}/apps/${appName}${suffix}`;
  }
  let query = [];

  if (name || resourceName) {
    prefix += `/${name || resourceName}`;
  }

  if (app_id) {
    query.push(`app_id=${app_id}`);
  }
  if (versionID) {
    query.push(`versionID=${versionID}`);
  }
  if (workspace) {
    query.push(`workspace=${workspace}`);
  }
  if (query.length) {
    prefix += `?${query.join('&')}`;
  }
  return prefix;
}

export function getBaseOpenPitrixPath({ workspace, cluster, namespace }: PathParams): string {
  let path = '';

  if (workspace) {
    path += `/workspaces/${workspace}`;
  }

  if (isMultiCluster() && cluster) {
    path += `/clusters/${cluster}`;
  }

  if (namespace) {
    path += `/namespaces/${namespace}`;
  }

  return path;
}

export function getAppBaseOpenPitrixPath({ workspace, cluster, namespace }: PathParams): string {
  const query = [];

  if (isMultiCluster() && cluster) {
    query.push(`clusters=${cluster}`);
  }
  if (workspace) {
    query.push(`workspace=${workspace}`);
  }
  if (namespace) {
    query.push(`namespace=${namespace}`);
  }

  return query.length ? `?${query.join('&')}` : '';
}

export function getBaseResourceUrl(params: PathParams, module: string): string {
  return `kapis/resources.kubesphere.io/v1alpha3${getPath(params)}/${module}`;
}

export function filterParams(params: any) {
  const result = { ...params };

  if (result.app) {
    result.labelSelector = result.labelSelector || '';
    result.labelSelector += `app.kubernetes.io/name=${result.app}`;
    delete result.app;
  }

  return result;
}

export function useBaseList<T>(
  url: string,
  options?: Partial<UseListOptions<any>>,
  workspace?: string,
  resourceName?: string,
): UseListInstance<T> & { ascending: boolean } {
  const formatParams: UseQueryParamsOption = {
    ...options?.params,
    order: options?.params?.order || SORT_KEY,
    limit: options?.params?.noLimit ? MAX_LIMIT : options?.params?.limit || 10,
    status: options?.params?.status || STATUS,
  };

  return {
    ...useList({
      url,
      format: item => ({ ...item, workspace }),
      ...options,
      params: formatParams,
      paramsFormatFn: params => useListQueryParams(params as UseQueryParamsOption, resourceName),
    }),
    ascending: formatParams.reverse || true,
  };
}
