import React, { CSSProperties } from 'react';
import styled from 'styled-components';
import { useStore } from '@kubed/stook';
import { Outlet, useNavigate, useParams } from 'react-router-dom';

import { Banner } from '../../components';

const Wrapper = styled.div`
  margin-top: -68px;
`;

function BaseLayout(): JSX.Element {
  const { appId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useStore<number>('currentStep', -2);
  const style: CSSProperties | undefined = appId ? { backgroundColor: '#ffffff' } : undefined;

  function handleBack(): void {
    if (currentStep === -1) {
      return navigate('/apps');
    }

    if (currentStep === 0) {
      return navigate(`/apps/${appId}`);
    }

    setCurrentStep(Math.max(0, currentStep - 1));
  }

  return (
    <Wrapper style={style}>
      <Banner onBack={handleBack} />
      <Outlet />
    </Wrapper>
  );
}

export default BaseLayout;
