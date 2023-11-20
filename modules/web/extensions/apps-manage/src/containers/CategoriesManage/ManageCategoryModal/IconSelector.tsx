import React from 'react';
import styled from 'styled-components';

import { Icon, openpitrixStore } from '@ks-console/shared';

const Icons = styled.div`
  margin: 0 30px 0 -6px;

  svg {
    &.active,
    &:hover {
      opacity: 1;
      border-radius: 4px;
      border-color: ${({ theme }) => theme.palette.accents_5};
      box-shadow: 0 4px 8px 0 rgba(36, 46, 66, 0.06);
    }
  }
`;

const StyledIcon = styled(Icon)`
  display: inline-block;
  margin: 0 4px 4px 0;
  width: 32px;
  height: 32px;
  padding: 4px;
  line-height: 28px;
  text-align: center;
  border: 1px solid transparent;
  cursor: pointer;
  opacity: 0.4;
`;

type Props = {
  value?: string;
  onChange?: (value: string) => void;
};

function IconSelector({ value, onChange }: Props): JSX.Element {
  const { CATEGORY_ICONS } = openpitrixStore;

  const changeIcon = (icon: string): void => {
    onChange?.(icon);
  };

  return (
    <Icons>
      {CATEGORY_ICONS.map(icon => (
        <StyledIcon
          key={icon}
          className={`${icon === value} && 'active'`}
          name={icon}
          size={20}
          onClick={() => changeIcon(icon)}
        />
      ))}
    </Icons>
  );
}

export default IconSelector;
