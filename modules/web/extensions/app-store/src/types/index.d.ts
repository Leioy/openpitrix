type LatestAppVersion = {
  active: boolean;
  app_id: string;
  create_time: string;
  name: string;
  owner: string;
  package_name: string;
  status: string;
  status_time: string;
  update_time: string;
  version_id: string;
  sources?: string;
  maintainers?: string;
  icon?: string;
  description?: string;
};

type CategoryDetail = {
  name: string;
  category_id: string;
  create_time?: string;
  locale?: string;
  status?: string;
  description?: string;
};

type AppDetail = {
  app_id: string;
  app_version_types: string;
  category_set: CategoryDetail[];
  create_time: string;
  isv: string;
  latest_app_version: LatestAppVersion;
  name: string;
  owner: string;
  status: string;
  status_time: string;
  update_time: string;
  cluster_total: number;
  home?: string;
  icon?: string;
  description?: string;
  abstraction?: string;
  screenshots?: unknown;
  keywords?: string;
};

type ListData<T> = Array<T & { workspace?: string }>;

type ListResponse<T> = {
  data: ListData<T>;
  total: number;
  limit: number;
  page: number;
  order: any;
  reverse: any;
  filters: Record<string, any>;
  selectedRowKeys: any[];
};

type DefaultSet = {
  defaultRepo?: string | string[];
  defaultStatus?: string;
  resourceName?: string;
  [ket: string]: unknown;
};

type QueryListParams = {
  orderBy: string;
  paging: string;
  conditions: string;
  reverse?: boolean;
  statistics?: boolean;
};

type QueryParams = {
  limit?: number;
  page?: number;
  noLimit?: boolean;
  status?: string;
  app_id?: string;
  version_id?: string;
  repo_id?: string;
  statistics?: boolean;
  order?: string;
  reverse?: boolean;
  more?: any;
  workspace?: string;
  filters?: Record<string, any>;
  keyword?: string;
  category_id?: string;
  [key: string]: unknown;
};

type DeployFormData = {
  name?: string;
  version_id?: string;
  namespace?: string;
  app_id?: string;
  workspace?: string;
  cluster?: string;
  conf?: any;
};

type FilesDetail = Record<string, string> | undefined;

type ConfigValuesJson = {
  affinity?: Record<string, any>;
  config?: string;
  fullnameOverride?: string;
  image?: { repository: string; pullPolicy: string };
  imagePullSecrets?: any[];
  nameOverride?: string;
  nodeSelector?: Record<string, any>;
  password?: string;
  persistence?: { size: string };
  resources?: Record<string, any>;
  service?: { type: string; port: number };
  tests?: { enabled: boolean };
  tolerations?: any[];
};

type AppConfigDetail = {
  valuesYaml?: string;
  valuesJSON?: ConfigValuesJson;
  valuesSchema?: Record<string, any>;
};

type PathParams = {
  resourceName: string;
  name?: string;
  app_id?: string;
  workspace?: string;
  version_id?: string;
};

type FilesResponse = {
  files: Record<string, string>;
  version_id: string;
};

type ValidNamespace = {
  label: string;
  value: string;
  disabled: boolean;
  isFedManaged: boolean;
};
