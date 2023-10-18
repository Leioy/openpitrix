import { useMutation, useQuery } from 'react-query';
import { request, UseListOptions, PathParams } from '@ks-console/shared';
import { defaultUrl, useBaseList } from './base';

type RepoPathParams = PathParams & { repo_id?: string; app_id?: string; version_id?: string };

export function getRepoUrl({ workspace, repo_id, name }: RepoPathParams): string {
  let prefix = defaultUrl;

  if (workspace) {
    prefix += `/workspaces/${workspace}`;
  }

  if (repo_id) {
    return `${prefix}/repos/${repo_id}/${name || ''}`;
  }

  return `${prefix}/repos`;
}

export function useRepoList(
  { workspace, app_id, version_id }: RepoPathParams,
  options?: Partial<UseListOptions<any>>,
) {
  const url = getRepoUrl({ workspace, app_id, version_id });

  return useBaseList(url, { format: data => data, ...options }, workspace, 'repos');
}

export function validateRepoUrl(workspace: string, params: Record<string, string>): Promise<void> {
  return request.post(`${getRepoUrl({ workspace })}?validate=true`, params);
}

type RepoMutateProps = {
  params: Record<string, any>;
  repo_id?: string;
};

export function useRepoMutation(workspace: string, options?: { onSuccess?: () => void }) {
  const onSuccess = options?.onSuccess;
  return useMutation(
    ({ params, repo_id }: RepoMutateProps) => {
      const url = getRepoUrl({ workspace, repo_id });
      const mutator = repo_id ? request.patch : request.post;

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
        reposId.map((repo_id: string) => request.delete(getRepoUrl({ workspace, repo_id }))),
      ),
    {
      onSuccess,
    },
  );
}

export function fetchRepoDetail(workspace: string, repo_id: string): Record<string, any> {
  const url = getRepoUrl({ workspace, repo_id });

  return request.get(url);
}

export function useRepoDetail(workspace: string, repo_id: string) {
  return useQuery(['repo', 'detail', repo_id], () => fetchRepoDetail(workspace, repo_id), {
    enabled: !!workspace && !!repo_id,
  });
}
