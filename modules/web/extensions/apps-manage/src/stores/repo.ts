import { useMutation, useQuery } from 'react-query';
import { request, UseListOptions, PathParams } from '@ks-console/shared';
import { defaultUrl, useBaseList } from './base';

type RepoPathParams = PathParams & { repo_name?: string; app_name?: string; version_id?: string };

export function getRepoUrl({ workspace, repo_name }: RepoPathParams): string {
  let prefix = defaultUrl + '/repos';
  if (repo_name) {
    prefix += `/${repo_name}`;
  }

  if (workspace) {
    prefix += `?workspaces=${workspace}`;
  }
  return `${prefix}`;
}

export function useRepoList(
  { workspace, app_name, version_id }: RepoPathParams,
  options?: Partial<UseListOptions<any>>,
) {
  const url = getRepoUrl({ workspace, app_name, version_id });

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

export function fetchRepoDetail(workspace: string, app_name: string): Record<string, any> {
  const url = getRepoUrl({ workspace, app_name });

  return request.get(url);
}

export function useRepoDetail(workspace: string, repo_id: string) {
  return useQuery(['repo', 'detail', repo_id], () => fetchRepoDetail(workspace, repo_id), {
    enabled: !!workspace && !!repo_id,
  });
}
