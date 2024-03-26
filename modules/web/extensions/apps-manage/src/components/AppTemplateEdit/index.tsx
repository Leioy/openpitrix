import React, { useEffect } from 'react';
import { get } from 'lodash';
import { useV3action, getAnnotationsName } from '@ks-console/shared';
interface Props {
  onCancel?: () => void;
  detail: any;
  success?: (params?: any) => void;
  visible: boolean;
}
export function AppTemplateEdit({ onCancel, detail, success, visible }: Props) {
  const { open, render: RenderTemplate } = useV3action();

  function handleEdit() {
    onCancel?.();
    const details = {
      name: detail.metadata.name,
      icon: detail?.spec?.icon,
      appHome: detail?.spec?.appHome,
      attachments: detail?.spec?.attachments,
      abstraction: detail?.spec?.abstraction,
      aliasName: getAnnotationsName(detail, 'kubesphere.io/alias-name'),
      description: getAnnotationsName(detail, 'kubesphere.io/description'),
      categoryName: get(detail, 'metadata.labels["application.kubesphere.io/app-category-name"]'),
      workspace: get(detail, 'metadata.labels["kubesphere.io/workspace"]'),
    };
    open({
      action: 'openpitrix.template.edit.v2',
      v3Module: 'appStore',
      module: 'apptemplates',
      detail: details,
      workspace: details.workspace,
      v3StoreParams: {
        module: 'edgeappsets',
      },
      success,
      onCancel: () => {
        onCancel?.();
      },
    });
  }

  useEffect(() => {
    if (visible && detail) {
      handleEdit();
    }
  }, [visible, detail]);

  return RenderTemplate();
}

export default AppTemplateEdit;
