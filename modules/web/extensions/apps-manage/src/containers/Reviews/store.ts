import { openpitrixStore, request } from '@ks-console/shared';

const { getBaseUrl } = openpitrixStore;

const resourceName: string = 'reviews';

type HandleParams = {
  app_name: string;
  [key: string]: unknown;
};

const handleReview = async ({ app_name, ...data }: HandleParams) => {
  const url = getBaseUrl({ app_name, name: 'action' }, resourceName);

  await request.post(url, data);
};

export default { handleReview };
