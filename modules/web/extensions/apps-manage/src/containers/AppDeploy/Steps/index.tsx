import React from 'react';

import { Indicator, StepWrapper } from './styles';

type Props = {
  steps: any[];
  current: any;
};

function Steps({ steps, current }: Props): JSX.Element {
  return (
    <StepWrapper>
      {steps.map((step, index) => {
        const cls = [
          'indicator',
          current > index && 'fullfill',
          current === index && 'current',
          current < index && 'pending',
        ].filter(item => item);

        return (
          <div key={step.title}>
            <Indicator className={cls.join(' ')} />
            <span>{t(step.title)}</span>
          </div>
        );
      })}
    </StepWrapper>
  );
}

export default Steps;
