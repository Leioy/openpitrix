import { useMutation, useQuery } from 'react-query';
import { request, UseListOptions, PathParams } from '@ks-console/shared';
import { defaultUrl, useBaseList } from './base';

type RepoPathParams = PathParams & { repo_name?: string; appName?: string; versionID?: string };

export function getRepoUrl({ workspace, repo_name, name }: RepoPathParams): string {
  let prefix = defaultUrl;

  if (workspace) {
    prefix += `/workspaces/${workspace}`;
  }

  if (repo_name) {
    return `${prefix}/repos/${repo_name}/${name || ''}`;
  }

  return `${prefix}/repos`;
}

export function useRepoList(
  { workspace, appName, versionID }: RepoPathParams,
  options?: Partial<UseListOptions<any>>,
) {
  const url = getRepoUrl({ workspace, appName, versionID });

  return useBaseList(url, { format: data => data, ...options }, workspace, 'repos');
}

export function validateRepoUrl(workspace: string, params: Record<string, string>): Promise<void> {
  return request.post(`${getRepoUrl({ workspace })}?validate=true`, params);
}

type RepoMutateProps = {
  params: Record<string, any>;
  repo_name?: string;
};

export function useRepoMutation(workspace: string, options?: { onSuccess?: () => void }) {
  const onSuccess = options?.onSuccess;
  return useMutation(
    ({ params, repo_name }: RepoMutateProps) => {
      const url = getRepoUrl({ workspace, repo_name });
      const mutator = request.post;

      return mutator(url, params);
    },
    {
      onSuccess,
    },
  );
}

export function useReposDeleteMutation(workspace: string, options?: { onSuccess?: () => void }) {
  const onSuccess = options?.onSuccess;
  return useMutation(
    (reposId: string[]) =>
      Promise.allSettled(
        reposId.map((repo_name: string) => request.delete(getRepoUrl({ workspace, repo_name }))),
      ),
    {
      onSuccess,
    },
  );
}

export function fetchRepoDetail(workspace: string, appName: string): Record<string, any> {
  const url = getRepoUrl({ workspace, appName });

  return request.get(url);
}

export function useRepoDetail(workspace: string, repo_id: string) {
  return useQuery(['repo', 'detail', repo_id], () => fetchRepoDetail(workspace, repo_id), {
    enabled: !!workspace && !!repo_id,
  });
}
