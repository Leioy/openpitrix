import { isArray, isString, keys, omit } from 'lodash';
import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';

import { Constants, downloadFileFromBase64, request, safeAtob } from '@ks-console/shared';

import { BaseUrlParams, getBaseUrl } from './base';

const resourceName = 'files';

export function fetchAppFiles({
  name,
  version_id,
}: BaseUrlParams): Promise<Record<string, string>> {
  const url = getBaseUrl({ app_name: name, version_id }, resourceName);

  return request.get(url).then((res: any) => {
    return Object.entries(res).reduce((acc: Record<string, string>, [key, value]) => {
      acc[key] = safeAtob(value);
      return acc;
    }, {});
  });
}

export function handleFileByBase64Str(file: File, callBack: (base64Str: string) => void) {
  const reader = new FileReader();
  // reader.readAsDataURL(file, 'UTF-8');
  reader.readAsDataURL(file);
  reader.addEventListener('load', async () => {
    const readerResult = reader.result;
    // const base64Str = readerResult.substring(readerResult.indexOf(',') + 1, readerResult.length);
    let base64Str = '';
    if (isString(readerResult)) {
      base64Str = readerResult.substring(readerResult.indexOf(',') + 1, readerResult.length);
    } else if (isArray(readerResult)) {
      base64Str = readerResult
        .join(',')
        .substring(readerResult.indexOf(',') + 1, readerResult.length);
    }

    return callBack(base64Str);
  });
}

type ValidateResponse = {
  description: string;
  version_name: string;
  name?: string;
  error_details?: Record<string, unknown>;
};

type ValidatePackageResponse = Partial<ValidateResponse> & {
  base64Str?: string;
  missFile?: string[];
  error?: string;
};

export async function validatePackage(
  base64Str: string,
  app_name: string,
  name?: string,
  version_name?: string,
): Promise<ValidatePackageResponse> {
  const data: Record<string, string | undefined> = {
    [`${!app_name ? 'app_' : ''}type`]: 'helm',
    package: base64Str,
    name,
    version_name,
  };
  const result: ValidateResponse | undefined = await request.post(
    `${getBaseUrl({ app_name, name: app_name ? 'versions' : 'apps' }, resourceName)}?validate=true`,
    data,
  );
  const response: ValidatePackageResponse = result ? { ...result } : {};

  if (result?.name) {
    response.base64Str = base64Str;
  }

  if (result?.error_details) {
    response.error = 'MISS_FILE_NOTE';
    response.missFile = keys(result.error_details);
  }

  return response;
}

export type UploadPackageParams = {
  base64Str?: string;
  version_type?: string;
  name?: string;
  icon?: string;
  type?: string;
  app_id?: string;
  workspace?: string;
  version_package?: string;
  package?: string;
};

/**
 *
 * @param type CREATE_APP, CREATE_VERSION, MODIFY_VERSION
 * @param callFun createApp, createVersion, modifyVersion
 */
export async function uploadPackage(
  type: string,
  params: UploadPackageParams,
  callFun?: (data: Omit<UploadPackageParams, 'base64Str'>) => any,
) {
  const data: UploadPackageParams = {
    ...omit(params, 'base64Str'),
    [`${type === 'CREATE_APP' ? 'version_' : ''}package`]: params.base64Str,
  };

  return callFun?.(data);
}

export type FileError = string;

export function checkFile(uploadFile: File, type: string): FileError {
  const rule = Constants.UPLOAD_CHECK_RULES[type];

  if (!rule.format.test(uploadFile.name.toLocaleLowerCase())) {
    return `FILE_FORMAT_${type.toLocaleUpperCase()}`;
  }

  if (uploadFile.size > rule.size) {
    return `FILE_MAX_${type.toLocaleUpperCase()}`;
  }

  return '';
}

export function validateImageSize(base64Str: string): Promise<any> {
  const image = new Image();
  image.src = base64Str;

  return new Promise(resolve => {
    image.addEventListener('load', async () => {
      let result = true;
      if (image.width > 96 || image.height > 96) {
        result = false;
      }
      resolve(result);
    });
  });
}

export async function downloadPackage(
  { app_name, version_id }: BaseUrlParams,
  packageName: string,
): Promise<void> {
  const url = getBaseUrl({ app_name, version_id, name: 'package' }, 'versions');
  const result: any = await request.get(url);
  downloadFileFromBase64(result.package, packageName);
}

type FilesDetail = Record<string, string> | undefined;

type QueryFilesInput = Pick<BaseUrlParams, 'name' | 'version_id'>;

export function useQueryFiles(
  { name, version_id }: QueryFilesInput,
  options?: UseQueryOptions<FilesDetail, Error>,
): UseQueryResult<FilesDetail, Error> {
  return useQuery<FilesDetail, Error>(
    ['files', name, version_id],
    (): Promise<FilesDetail> => {
      if (options?.enabled === false) {
        return Promise.resolve(undefined);
      }
      return fetchAppFiles({ name, version_id });
    },
    options,
  );
}
