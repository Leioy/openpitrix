import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@kubed/stook';
import { Button, Loading } from '@kubed/components';
import { useNavigate, useParams } from 'react-router-dom';

import type { AppConfigRefType, AppBaseInfoData, AppBaseInfoFormRef } from '@ks-console/shared';
import { isRadonDB, AppConfigForm, AppBaseInfoForm, openpitrixStore } from '@ks-console/shared';

import Steps from './Steps';

import { FormWrapper, StepsWrapper, StyledCol } from './styles';

function AppDeploy(): JSX.Element {
  const navigate = useNavigate();
  const { appId = '' } = useParams<'appId'>();
  const { deployApp } = openpitrixStore;
  const baseInfoFormRef = useRef<AppBaseInfoFormRef>(null);
  const configRef = useRef<AppConfigRefType>(null);
  const [confirmedBaseInfoData, setConfirmedBaseInfoData] = useState<AppBaseInfoData>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [appListIsLoading] = useStore<boolean>('appListIsLoading');
  const [currentStep, setCurrentStep] = useStore<number>('currentStep');

  const steps = [
    {
      title: 'BASIC_INFORMATION',
      component: (
        <AppBaseInfoForm
          ref={baseInfoFormRef}
          appId={appId}
          versionStatus="active"
          confirmedData={confirmedBaseInfoData}
        />
      ),
      required: true,
      isForm: true,
    },
    {
      title: 'APP_SETTINGS',
      component: isRadonDB(appId) ? (
        <>{/* {TODO: Render DB App Config} */}</>
      ) : (
        <AppConfigForm
          ref={configRef}
          appId={appId}
          versionId={confirmedBaseInfoData?.version_id}
        />
      ),
      required: true,
    },
  ];

  const handleNext = () => {
    baseInfoFormRef.current
      ?.validateFields()
      .then(baseInfoData => {
        setConfirmedBaseInfoData(baseInfoData);
        setCurrentStep(current => (current < steps.length - 1 ? current + 1 : current));
      })
      .catch(() => null); // in order to avoid error tip in browser console when this validate is failed
  };

  const handleOk = async (): Promise<void> => {
    setIsSubmitting(true);
    const finalData = {
      app_id: appId,
      ...confirmedBaseInfoData,
      conf: configRef.current?.conf,
    };
    const { cluster, namespace, workspace, ...rest } = finalData;

    await deployApp(rest, { cluster, namespace, workspace });
    setIsSubmitting(false);
    navigate(`/${workspace}/clusters/${cluster}/projects/${namespace}/applications`);
  };

  useEffect(() => setCurrentStep(0), []);

  return (
    <>
      <StepsWrapper>
        <Steps steps={steps} current={currentStep} />
      </StepsWrapper>
      <FormWrapper>
        <StyledCol span={10}>
          {appListIsLoading && <Loading className="page-loading" />}
          {!appListIsLoading && steps[currentStep]?.component}
        </StyledCol>
        <StyledCol span={2}>
          {currentStep < steps.length - 1 ? (
            <Button color="dark" onClick={handleNext}>
              {t('NEXT')}
            </Button>
          ) : (
            <Button color="dark" onClick={handleOk} loading={isSubmitting}>
              {t('INSTALL')}
            </Button>
          )}
        </StyledCol>
      </FormWrapper>
    </>
  );
}

export default AppDeploy;
