import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import {
  request,
  safeAtob,
  useList,
  UseListOptions,
  UseListInstance,
  isMultiCluster,
} from '@ks-console/shared';

import { getQueryListParams } from './utils';

const baseUrl = 'kapis/openpitrix.io/v2';

function getUrl({ resourceName, workspace, app_id, version_id, name }: PathParams): string {
  let prefix = baseUrl;

  if (workspace) {
    prefix += `/workspaces/${workspace}`;
  }

  if (version_id) {
    const suffix = resourceName === 'versions' ? '' : resourceName;
    return `${prefix}/apps/${app_id}/versions/${version_id}/${name || suffix}`;
  }

  if (app_id) {
    const suffix = resourceName === 'apps' ? '' : resourceName;
    return `${prefix}/apps/${app_id}/${name || suffix}`;
  }

  return `${prefix}/${name || resourceName}`;
}

function getDeployPath({ workspace, cluster, namespace }: QueryParams): string {
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

export function getCategoriesUrl({ category_id }: QueryParams): string {
  if (category_id) {
    return `${baseUrl}/categories/${category_id}`;
  }

  return `${baseUrl}/categories`;
}

export function useQueryDataByResourceName<T>(
  resourceName: string,
  params: QueryParams,
  options?: Partial<UseListOptions<T>>,
): UseListInstance<T> & { reverse: boolean } {
  const queryParams = getQueryListParams(resourceName, params);
  const url = getUrl({
    resourceName,
    workspace: params.workspace,
    app_id: params.app_id,
    version_id: params.version_id,
  });
  const result = useList<T>({
    url,
    params: queryParams,
    ...options,
  });
  const data = result.data?.map((item: T) => ({
    ...item,
    workspace: params.workspace,
  }));

  return {
    ...result,
    data,
    reverse: params.reverse || true,
    // filters: omit(params.filters, ['isv', 'workspace', 'category_id']),
  };
}

export async function fetchDetail(app_id: string): Promise<AppDetail> {
  const result: AppDetail = await request.get(getUrl({ resourceName: 'apps', app_id }));

  return result;
}

export async function fetchFiles({ app_id, version_id }: QueryParams): Promise<FilesDetail> {
  // this.filters = Object.assign(this.filters, filters);
  const result: FilesResponse = await request.get(
    getUrl({ resourceName: 'files', app_id, version_id }),
  );

  if (result) {
    const files: Record<string, string> = result.files || {};
    Object.keys(files).forEach(name => {
      files[name] = safeAtob(files[name]);
    });
    return files;
  }
}

type QueryFilesInput = Pick<QueryParams, 'app_id' | 'version_id'>;

export function useQueryFiles(
  { app_id, version_id }: QueryFilesInput,
  options?: UseQueryOptions<FilesDetail, Error>,
): UseQueryResult<FilesDetail, Error> {
  return useQuery<FilesDetail, Error>(
    ['files', app_id, version_id],
    (): Promise<FilesDetail> => {
      if (options?.enabled === false) {
        return Promise.resolve(undefined);
      }
      return fetchFiles({ app_id, version_id });
    },
    options,
  );
}

export async function deployApp(
  params: Record<string, any>,
  { workspace, namespace, cluster }: Record<string, any>,
): Promise<void> {
  if (namespace) {
    request.post(
      `${baseUrl}${getDeployPath({
        workspace,
        namespace,
        cluster,
      })}/applications`,
      params,
    );
  }
}
