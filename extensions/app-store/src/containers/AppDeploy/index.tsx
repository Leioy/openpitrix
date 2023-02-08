import React, { useEffect, useState } from 'react';
import { get } from 'lodash';
import { useQuery } from 'react-query';
import { useStore } from '@kubed/stook';
import { getQuery } from '@ks-console/shared';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Loading, useForm } from '@kubed/components';

import Steps from './Steps';
import BasicInfo from './BasicInfo';
import AppConfig from './AppConfig';
import { generateId } from '../../utils';
import { deployApp, fetchDetail, useQueryDataByResourceName } from '../../store';

import { FormWrapper, StepsWrapper } from './styles';

function AppDeploy(): JSX.Element {
  const navigate = useNavigate();
  const [basicInfoForm] = useForm();
  const { appId } = useParams();
  const { namespace: qNamespace } = getQuery<{ namespace: string }>();
  const [isSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<DeployFormData>({});
  const [, setAppDetail] = useStore<AppDetail>('appDetail');
  const [appListIsLoading] = useStore<boolean>('appListIsLoading');
  const [currentStep, setCurrentStep] = useStore<number>('currentStep');
  const { data: versions, refresh: refreshVersions } = useQueryDataByResourceName<LatestAppVersion>(
    'versions',
    { app_id: appId, status: 'active' },
    {
      autoFetch: false,
      onSuccess: ({ items }: any) => {
        const selectAppVersion = get(items, '[0].version_id', '');
        setFormData((prevData: DeployFormData) => ({ ...prevData, version_id: selectAppVersion }));
      },
    },
  );
  const {} = useQuery(['appDetail', appId], () => fetchDetail(appId || ''), {
    enabled: !!appId,
    onSuccess: (appDetail: AppDetail) => {
      const { name } = appDetail;
      setAppDetail(appDetail);
      setFormData((prevData: DeployFormData) => ({
        ...prevData,
        name: `${name.slice(0, 7).toLowerCase().replaceAll(' ', '-')}-${generateId()}`,
      }));
    },
  });
  const steps = [
    {
      title: 'BASIC_INFORMATION',
      component: (
        <BasicInfo
          form={basicInfoForm}
          initFormData={formData}
          versions={versions}
          initNamespace={qNamespace}
          patchFormData={(patchData: Partial<DeployFormData>) =>
            setFormData(prev => ({ ...prev, ...patchData }))
          }
        />
      ),
      required: true,
      isForm: true,
    },
    {
      title: 'APP_SETTINGS',
      component: (
        <AppConfig
          appId={appId}
          versionId={formData.version_id}
          patchFormData={(patchData: Partial<DeployFormData>) =>
            setFormData(prev => ({ ...prev, ...patchData }))
          }
        />
      ),
      required: true,
    },
  ];

  function handleNext(): void {
    basicInfoForm
      .validateFields()
      .then(() => {
        setCurrentStep(current => (current < steps.length - 1 ? current + 1 : current));
      })
      .catch(() => null);
  }

  async function handleOk(): Promise<void> {
    const { cluster, namespace, workspace, ...rest } = { app_id: appId, ...formData };

    await deployApp(rest, { cluster, namespace, workspace });
    navigate(`/${workspace}/clusters/${cluster}/projects/${namespace}/applications/template`);
  }

  useEffect(() => {
    if (!appId) return;

    refreshVersions();
  }, [appId]);

  useEffect(() => setCurrentStep(0), []);

  return (
    <>
      <StepsWrapper>
        <Steps steps={steps} current={currentStep} />
      </StepsWrapper>
      <FormWrapper>
        <Col span={10}>
          {appListIsLoading && <Loading className="page-loading" />}
          {!appListIsLoading && steps[currentStep]?.component}
        </Col>
        <Col span={2}>
          {currentStep < steps.length - 1 ? (
            <Button color="dark" onClick={handleNext}>
              {t('NEXT')}
            </Button>
          ) : (
            <Button color="dark" onClick={handleOk} loading={isSubmitting}>
              {t('INSTALL')}
            </Button>
          )}
        </Col>
      </FormWrapper>
    </>
  );
}

export default AppDeploy;
