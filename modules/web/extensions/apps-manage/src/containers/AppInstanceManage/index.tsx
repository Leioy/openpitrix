import React from 'react';

import { Applications } from '@ks-console/shared';

export function AppInstanceManage() {
  return <Applications cluster="edge1" namespace="monitor-prod" workspace="edge123" />;
}

export default AppInstanceManage;
