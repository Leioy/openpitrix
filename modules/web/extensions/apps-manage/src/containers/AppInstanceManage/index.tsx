import React from 'react';

import { Applications } from '@ks-console/shared';

export function AppInstanceManage() {
  return <Applications cluster="host" namespace="demo" workspace="demo" />;
}

export default AppInstanceManage;
