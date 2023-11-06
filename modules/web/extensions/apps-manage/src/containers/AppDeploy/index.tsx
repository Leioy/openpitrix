import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@kubed/stook';
import { Button, Loading } from '@kubed/components';
import { useParams } from 'react-router-dom';

import type { AppConfigRefType, AppBaseInfoData, AppBaseInfoFormRef } from '@ks-console/shared';
import { isRadonDB, safeBtoa } from '@ks-console/shared';
import { AppConfigForm, AppBaseInfoForm } from '../../components/AppForms';
import { deployApp } from '../../stores';
import Steps from './Steps';

import { FormWrapper, StepsWrapper, StyledCol } from './styles';

interface Props {
  close: () => void;
  onOk: () => void;
  appName: string;
  versionId?: string;
}

function AppDeploy({ close, appName, versionId }: Props): JSX.Element {
  const { workspace } = useParams();
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
          appName={appName}
          versionId={versionId}
          versionStatus="active"
          confirmedData={confirmedBaseInfoData}
        />
      ),
      required: true,
      isForm: true,
    },
    {
      title: 'APP_SETTINGS',
      component: isRadonDB(appName) ? (
        <>{/* {TODO: Render DB App Config} */}</>
      ) : (
        <AppConfigForm
          ref={configRef}
          appName={appName}
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
    if (isSubmitting) return;
    setIsSubmitting(true);
    const finalData = {
      // name: appName,
      ...confirmedBaseInfoData,
      value: configRef.current?.conf,
      app_type: 'helm',
      app_id: appName,
    };
    const { cluster, namespace } = finalData;
    const params = {
      kind: 'ApplicationRelease',
      metadata: {
        name: confirmedBaseInfoData?.name,
      },
      spec: {
        app_id: appName,
        app_type: 'helm',
        appVersion_id: confirmedBaseInfoData?.version_id,
        values: safeBtoa(configRef.current?.conf),
      },
    };

    await deployApp(params, { cluster, namespace, workspace });
    setIsSubmitting(false);
    // navigate(`/${workspace}/clusters/${cluster}/projects/${namespace}/applications`);
  };

  useEffect(() => setCurrentStep(0), []);

  return (
    <>
      <StepsWrapper>
        <Steps steps={steps} current={currentStep} />
      </StepsWrapper>
      <FormWrapper>
        <StyledCol span={12}>
          {appListIsLoading && <Loading className="page-loading" />}
          {!appListIsLoading && steps[currentStep]?.component}
        </StyledCol>
      </FormWrapper>
      <div className="kubed-modal-footer">
        {currentStep < 1 ? (
          <Button color="default" onClick={close}>
            {t('CANCEL')}
          </Button>
        ) : (
          <Button color="dark" onClick={() => setCurrentStep(0)}>
            {t('BEFORE')}
          </Button>
        )}
        {currentStep > 0 ? (
          <Button color="dark" onClick={handleOk}>
            {t('OK')}
          </Button>
        ) : (
          <Button color="dark" onClick={handleNext}>
            {t('NEXT')}
          </Button>
        )}
      </div>
    </>
  );
}

export default AppDeploy;
