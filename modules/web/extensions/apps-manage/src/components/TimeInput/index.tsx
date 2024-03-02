import React, { ChangeEvent, useState } from 'react';
import styled from 'styled-components';
import { Input, Select } from '@kubed/components';

const TimeInputWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

type Props = {
  value?: any;
  onChange?: (value: any) => void;
};

enum TimeToS {
  s = 1,
  m = 60,
  h = 3600,
}

function TimeInput({ value, onChange }: Props): JSX.Element {
  const [unit, setUnit] = useState<'s' | 'm' | 'h'>('s');
  const [interval, setInterval] = useState<string>(value);
  const timeOptions = [
    {
      label: t('SECONDS'),
      value: 's',
    },
    {
      label: t('MINUTES'),
      value: 'm',
    },
    {
      label: t('HOURS'),
      value: 'h',
    },
  ];

  function getSeconds(timeStr: string): number {
    return +timeStr * TimeToS[unit];
  }

  function handleChangeValue({ target }: ChangeEvent<HTMLInputElement>): void {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    setInterval(target.value);
    // TODO 此处接口单位 s
    onChange?.(getSeconds(target.value));
  }

  function handleChangeUnit(unitStr: any): void {
    setUnit(unitStr);
  }

  return (
    <TimeInputWrapper className="time-input">
      <Input value={interval} onChange={handleChangeValue} />
      <Select value={unit} options={timeOptions} onChange={handleChangeUnit} />
    </TimeInputWrapper>
  );
}

export default TimeInput;
