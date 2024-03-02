export interface RepoData {
  apiVersion: string;
  kind: string;
  metadata: {
    creationTimestamp?: string;
    generation?: number;
    name: string;
    resourceVersion?: string;
    uid?: string;
  };
  spec: {
    name: string;
    credential?: Record<string, unknown>;
    syncPeriod?: number | string;
    url?: string;
  };
  status?: {
    state: string;
    specHash: string;
    lastUpdateTime: string;
  };
}
