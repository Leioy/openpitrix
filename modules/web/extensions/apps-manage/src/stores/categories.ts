import { UseListInstance, UseListOptions, request, CategoryDetail } from '@ks-console/shared';

import { defaultUrl, getBaseUrl, useBaseList } from './base';

const resourceName = 'categories';

export const CATEGORY_ICONS: string[] = [
  'database',
  'export',
  'documentation',
  'mail',
  'calendar',
  'column',
  'earth',
  'picture',
  'firewall',
  'ai',
  'camera',
  'image',
  'increase',
  'network',
  'router',
  'storage',
  'scissors',
  'loadbalancer',
  'ip',
  'blockchain',
  'car',
  'nodes',
  'usb-redirection',
  'coding',
  'cdn',
  'ssh',
  'linechart',
  'cart',
  'cluster',
  'role',
  'wrench',
  'radio',
];

export function getCategoriesUrl(category_id?: string): string {
  const baseCategoriesUrl = `${defaultUrl}/${resourceName}`;

  return baseCategoriesUrl + `${category_id ? `/${category_id}` : ''}`;
}

type UseCategoryListInput = {
  category_id?: string;
  options?: Partial<UseListOptions<unknown>>;
};

export function useCategoryList({
  category_id,
  options,
}: UseCategoryListInput = {}): UseListInstance<CategoryDetail> {
  const url = getCategoriesUrl(category_id);

  return useBaseList(url, options);
}

export function deleteCategory(category_id: string) {
  const url = getCategoriesUrl(category_id);
  return request.delete(url);
}

export function updateCategory(category_id: string, data: any) {
  return request.post(getCategoriesUrl(category_id), data);
}

export function createCategory(data: Pick<CategoryDetail, 'metadata' | 'spec'>) {
  const url = getBaseUrl({}, resourceName);
  return request.post(`${url}?create=1`, data);
}
