import { openpitrixStore, request } from '@ks-console/shared';

const { getBaseUrl } = openpitrixStore;

const resourceName: string = 'reviews';

type HandleParams = {
  app_name: string;
  versionId: string;
  action: string;
  message?: string;
};

const handleReview = async ({ app_name, versionId, ...data }: HandleParams) => {
  const url = getBaseUrl({ app_name, version_id: versionId, name: 'action' }, resourceName);

  await request.post(url, data);
};

export default { handleReview };
