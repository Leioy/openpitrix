import { isEmpty, isUndefined, trimStart } from 'lodash';
import { LabeledValue } from '@kubed/components';
import { customAlphabet } from 'nanoid';

import {
  sortKey,
  MAX_LIMIT,
  APP_DEFAULT_SET,
  VSERSION_DEFAULT_SET,
  CATEGORIY_DEFAULT_SET,
} from './constants';

export function getFilterString(
  params: Record<string, any>,
  fuzzyMatchKeys = ['name', 'app.kubernetes.io/name', 'label', 'annotation'],
) {
  return Object.keys(params)
    .filter(key => !isUndefined(params[key]) && params[key] !== '')
    .map(key =>
      fuzzyMatchKeys.includes(key) && !/\|/g.test(params[key])
        ? `${key}~${trimStart(params[key])}`
        : `${key}=${trimStart(params[key])}`,
    )
    .join(',');
}

export function formatImageUrl(src: string, isBase64Str: boolean): string {
  let imgStr = src;
  if (String(src).startsWith('att-')) {
    imgStr = `/kapis/openpitrix.io/v1/attachments/${src}?filename=raw`;
  }

  if (isBase64Str && !imgStr.includes('/attachments/')) {
    imgStr = `data:image/png;data:image/svg;data:image/jpg;base64,${src}`;
  }

  return imgStr;
}

export function getDefaultSetByResourceName(resourceName: string): DefaultSet {
  switch (resourceName) {
    case 'apps':
      return APP_DEFAULT_SET;
    case 'categories':
      return CATEGORIY_DEFAULT_SET;
    case 'versions':
      return VSERSION_DEFAULT_SET;
    default:
      return {} as DefaultSet;
  }
}

export function getConditions(
  resourceName: string,
  status?: string,
  app_id?: string,
  version_id?: string,
  repo_id?: string | string[],
) {
  const { defaultStatus, defaultRepo } = getDefaultSetByResourceName(resourceName);
  const conditions: Record<string, string | string[] | undefined> = {
    status: status || defaultStatus,
  };

  if (resourceName === 'applications') {
    conditions.app_id = app_id;
    conditions.version_id = version_id;
  }

  if (repo_id || defaultRepo) {
    conditions.repo_id = repo_id || defaultRepo;
  }

  return conditions;
}

export function getQueryListParams(
  resourceName: string,
  {
    status,
    app_id,
    version_id,
    repo_id,
    order,
    reverse,
    statistics,
    page,
    limit,
    noLimit,
    ...filters
  }: QueryParams,
): QueryListParams {
  const conditions = getConditions(resourceName, status, app_id, version_id, repo_id);

  const params: QueryListParams = {
    orderBy: order || sortKey,
    paging: `limit=${noLimit ? MAX_LIMIT : limit || 10},page=${page || 1}`,
    conditions: getFilterString(conditions),
  };

  if (reverse === undefined) {
    reverse = true;
  }

  if (!isEmpty(filters)) {
    if (filters.category_id === 'all') {
      filters.category_id = '';
    }

    const filterStr = getFilterString(filters);
    params.conditions += filterStr ? `,${filterStr}` : '';
  }

  if (reverse) {
    params.reverse = true;
  }

  if (statistics) {
    params.statistics = true;
  }

  return params;
}

export function isAppsPageExact(): boolean {
  return location.pathname === '/apps';
}

export function getAppCategoryNames(categories: CategoryDetail[]): string {
  const names = categories.reduce(
    (acc: string[], { category_id, name, status }: CategoryDetail) => {
      if (category_id && status !== 'disabled') {
        const result = category_id === 'ctg-uncategorized' ? t('APP_CATE_UNCATEGORIZED') : name;
        acc.push(t(result || category_id));
      }
      return acc;
    },
    [],
  );

  return isEmpty(names) ? '-' : names.join(', ');
}

export function getDefaultSelectFile(files: Record<string, string>, fileOptions: LabeledValue[]) {
  const hasDefaultPreview = files['values.yaml'];
  const firstFile = !isEmpty(fileOptions) ? fileOptions[0].value : '';
  return hasDefaultPreview ? 'values.yaml' : firstFile;
}

// todo use compare version module
export function compareVersion(v1: any, v2: any): any {
  if (typeof v1 + typeof v2 !== 'stringstring') {
    return false;
  }

  const a = v1.split('.');
  const b = v2.split('.');
  const len = Math.max(a.length, b.length);

  for (let i = 0; i < len; i++) {
    if ((a[i] && !b[i] && parseInt(a[i], 10) > 0) || parseInt(a[i], 10) > parseInt(b[i], 10)) {
      return 1;
    }
    if ((b[i] && !a[i] && parseInt(b[i], 10) > 0) || parseInt(a[i], 10) < parseInt(b[i], 10)) {
      return -1;
    }
  }

  return 0;
}

export function generateId(length?: number): string {
  return customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', length || 6)();
}

export function generateMarks(min: number, max: number): number[] {
  const n = 5;
  const step = parseInt(((max - min) / n).toString(), 10);
  const o: any[] = [];

  for (let i = 0; i < n; i++) {
    const v = min + i * step;
    o[v] = v;
  }

  o[max] = max;

  return o.filter(k => !!k);
}
