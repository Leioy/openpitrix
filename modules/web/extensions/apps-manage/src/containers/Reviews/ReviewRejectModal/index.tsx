import React from 'react';
import { SafeNotice } from '@kubed/icons';
import { Form, FormItem, Modal, Textarea, useForm } from '@kubed/components';

export type RejectFormData = {
  message?: string;
};

interface Props {
  visible: boolean;
  onOk?: (data: RejectFormData) => void;
  onCancel?: () => void;
}

function ReviewRejectModal({ visible, onOk, onCancel }: Props): JSX.Element {
  const [form] = useForm();

  const handleReject = () => form.validateFields().then(onOk);

  return (
    <Modal
      width={600}
      visible={visible}
      titleIcon={<SafeNotice size={20} />}
      title={t('REJECTION_REASON')}
      description={t('REJECT_REASON_DESC')}
      onOk={handleReject}
      onCancel={onCancel}
    >
      <Form form={form} className="rejectForm" style={{ padding: '20px' }}>
        <FormItem name={['message']} rules={[{ required: true, message: t('REJECT_REASON_TIP') }]}>
          <Textarea />
        </FormItem>
      </Form>
    </Modal>
  );
}

export default ReviewRejectModal;
