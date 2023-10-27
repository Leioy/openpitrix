import { openpitrixStore, request } from '@ks-console/shared';

const { getBaseUrl } = openpitrixStore;

const resourceName: string = 'reviews';

type HandleParams = {
  app_name: string;
  version_id: string;
  [key: string]: unknown;
};

const handleReview = async ({ app_name, version_id, ...data }: HandleParams) => {
  const url = getBaseUrl({ app_name, version_id, name: 'action' }, resourceName);

  await request.post(url, data);
};

export default { handleReview };
