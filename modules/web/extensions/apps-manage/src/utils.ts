import { isEmpty } from 'lodash';
import { LabeledValue } from '@kubed/components';

import { CategoryDetail, isUnCategorizedCtg } from '@ks-console/shared';

export function getScrollTop(): number {
  return window.pageYOffset !== undefined
    ? window.pageYOffset
    : (document.documentElement || document.body.parentNode || document.body).scrollTop;
}

export function transferReviewStatus(status: string): string {
  let transStatus;
  switch (status) {
    case 'submitted':
      transStatus = 'to-be-reviewed';
      break;
    case 'passed':
    case 'suspended':
    case 'rejected':
    case 'active':
      transStatus = status;
      break;
    default:
      transStatus = 'in-review';
  }

  return transStatus;
}

export function isAppsPageExact(): boolean {
  return location.pathname === '/apps';
}

export function getCategoryDisplayName(name: string): string {
  return t(`APP_CATE_${name.toUpperCase().replace(/[^A-Z]+/g, '_')}`, {
    defaultValue: name,
  });
}

export function getAppCategoryNames(categories: CategoryDetail[]): string {
  const names = categories.reduce((acc: string[], { metadata }: CategoryDetail) => {
    // TODO  if (metadata.name && status !== 'disabled') {
    if (metadata.name) {
      const result = isUnCategorizedCtg(metadata.name)
        ? t('APP_CATE_UNCATEGORIZED')
        : metadata.name;
      acc.push(t(result || metadata.name));
    }
    return acc;
  }, []);

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
