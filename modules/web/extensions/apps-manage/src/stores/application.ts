import { get } from 'lodash';
import { useMutation } from 'react-query';
import {
  request,
  useList,
  useListQueryParams,
  UseQueryParamsOption,
  PathParams,
} from '@ks-console/shared';

import { defaultUrl, getBaseOpenPitrixPath, getAppBaseOpenPitrixPath } from './base';

export type ApplicationPathParams = PathParams & {
  cluster_id?: string;
  zone?: string;
  appName?: string;
};

export const CLUSTER_QUERY_STATUS = 'creating|active|failed|deleting|upgrading|created|upgraded';

const STATUSES: Record<string, string> = {
  creating: 'Creating',
  created: 'Creating',
  active: 'Running',
  failed: 'Failed',
  deleting: 'Deleting',
  upgrading: 'Upgrading',
  upgraded: 'Upgrading',
};

export function dataItemFormatter(item: any): any {
  const status = get(item, 'status.state');

  return {
    ...item,
    ...item.metadata,
    selector: {
      'app.kubesphere.io/instance': item.metadata.name,
    },
    status: STATUSES[status],
  };
}

export function getApplicationUrl({
  workspace,
  namespace,
  cluster,
  cluster_id,
  appName,
}: ApplicationPathParams = {}): string {
  const url = `${defaultUrl}${getBaseOpenPitrixPath({
    workspace,
    namespace,
    cluster,
  })}/applications`;

  if (cluster_id || appName) {
    return `${url}/${cluster_id || appName}`;
  }

  return url;
}

export function getAppUrl({
  workspace,
  namespace,
  cluster,
  cluster_id,
  appName,
}: ApplicationPathParams = {}): string {
  const queryParams = getAppBaseOpenPitrixPath({
    workspace,
    namespace,
    cluster,
  });
  let url = `${defaultUrl}/apps`;
  if (cluster_id || appName) {
    url = `${url}/${cluster_id || appName}`;
  }
  if (queryParams) {
    url = `${url}${queryParams}`;
  }
  return url;
}

export async function deleteOPApp({
  workspace,
  cluster,
  zone,
  cluster_id,
}: ApplicationPathParams): Promise<any> {
  const url = getApplicationUrl({ namespace: zone, cluster, workspace, cluster_id });

  return request.delete(url);
}

export async function modifyCategoryOPApp(
  { workspace, cluster, zone, appName }: ApplicationPathParams,
  params: any,
): Promise<any> {
  const url = getAppUrl({ namespace: zone, cluster, workspace, appName });
  return request.patch(url, params);
}

export async function deleteApplication(applicationName: string): Promise<any> {
  const url = getApplicationUrl({ appName: applicationName });

  return request.delete(url);
}

export function useApplicationDeleteMutation(options?: { onSuccess?: () => void }) {
  const onSuccess = options?.onSuccess;
  return useMutation((data: Array<any>) => Promise.allSettled(data.map(deleteApplication)), {
    onSuccess,
  });
}

export async function patchOPApp({
  workspace,
  cluster,
  zone,
  cluster_id,
  name,
  description,
}: ApplicationPathParams & {
  name?: string;
  description?: string;
}): Promise<any> {
  const url = getApplicationUrl({ namespace: zone, cluster_id, cluster, workspace });

  return request.patch(url, {
    name,
    description,
  });
}

export async function upgradeOPApp(
  { workspace, namespace, cluster, cluster_id }: ApplicationPathParams,
  params: any,
) {
  return request.post(getApplicationUrl({ workspace, namespace, cluster, cluster_id }), params);
}

export function useAppModifyCateGoryMutation(options?: { onSuccess?: () => void }) {
  const onSuccess = options?.onSuccess;
  return useMutation(
    data => {
      const { baseMutateData = [], param } = data as any;
      return Promise.allSettled(
        baseMutateData?.map((item: ApplicationPathParams) => modifyCategoryOPApp(item, param)),
      );
    },
    {
      onSuccess,
    },
  );
}

export function useAppDeleteMutation(options?: { onSuccess?: () => void }) {
  const onSuccess = options?.onSuccess;
  return useMutation((data: Array<any>) => Promise.allSettled(data.map(deleteOPApp)), {
    onSuccess,
  });
}

export function useAppEditMutation(options?: { onSuccess?: () => void }) {
  const onSuccess = options?.onSuccess;
  return useMutation((data: any) => patchOPApp(data), {
    onSuccess,
  });
}

export function fetchApplicationDetail({
  workspace,
  namespace,
  cluster,
  appName,
}: ApplicationPathParams): any {
  const url = getApplicationUrl({ workspace, namespace, cluster, appName });

  return request.get(url).then(dataItemFormatter);
}

export function useApplicationsList(
  { cluster, namespace, workspace }: PathParams,
  params: Record<string, any>,
) {
  const url = getApplicationUrl({ workspace, namespace, cluster });
  const formattedParams: Record<string, any> = {
    ...params,
    status: params.status || CLUSTER_QUERY_STATUS,
    order: params.order || 'status_time',
  };

  return useList({
    url,
    params: formattedParams,
    paramsFormatFn: ({ appName, keyword, ...rest }) => {
      const requestParams = useListQueryParams(rest as UseQueryParamsOption);
      let conditions = requestParams.conditions;

      if (params.appName) {
        conditions += `,appName=${params.appName}`;
      }

      if (params.keyword) {
        conditions += `,keyword=${params.keyword}`;
      }

      return {
        ...requestParams,
        conditions,
      };
    },
    format: item => ({ ...dataItemFormatter(item), workspace, cluster }),
  });
}
