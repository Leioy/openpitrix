export const sortKey = 'create_time';

export const STORE_APP_LIMIT = 12;

export const CATELATEST = 'new';

export const uncateKey = 'ctg-uncategorized';

export const noCategories = ['new', 'all'];

export const scrollThreshold = 200;

export const MAX_LIMIT = 200;

export const STORE_QUERY_STATUS = 'active|suspended';

export const DEFAULT_QUERY_STATUS = 'draft|submitted|rejected|in-review|passed|active|suspended';

export const APP_DEFAULT_SET: DefaultSet = {
  defaultRepo: 'repo-helm',
  defaultStatus: 'active|suspended',
};

export const CATEGORIY_DEFAULT_SET: DefaultSet = {
  defaultRepo: [],
  defaultStatus: '',
};

export const VSERSION_DEFAULT_SET: DefaultSet = {
  sortKey: 'sequence',
  defaultStatus: DEFAULT_QUERY_STATUS,
};
