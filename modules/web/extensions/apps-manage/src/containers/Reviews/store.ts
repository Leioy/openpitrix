import { openpitrixStore, request } from '@ks-console/shared';

const { getBaseUrl } = openpitrixStore;

const resourceName: string = 'reviews';

type HandleParams = {
  appName: string;
  versionID: string;
  action: string;
  message?: string;
};

const handleReview = async ({ appName, versionID, ...data }: HandleParams) => {
  const url = getBaseUrl({ appName, versionID: versionID, name: 'action' }, resourceName);

  await request.post(url, data);
};

export default { handleReview };
