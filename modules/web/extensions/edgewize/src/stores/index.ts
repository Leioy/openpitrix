import { request } from '@ks-console/shared';

const defaultUrl = '/kapis/tenant.kubesphere.io/v1alpha3/workspacetemplates';

export function editWorkspaceLabels(workspace: string, params: Record<string, any>) {
  const url = `${defaultUrl}/${workspace}`;
  return request.patch(url, params);
}
