import styled from 'styled-components';
import { Row, Select } from '@kubed/components';

export const PlacementWrapper = styled.div`
  position: relative;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.palette.border};
  border-radius: 4px;
  background-color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease-in-out;

  &:hover {
    border-color: ${({ theme }) => theme.palette.accents_5};
    box-shadow: 0 4px 8px 0 rgba(36, 46, 66, 0.2);
  }
`;

export const Wrapper = styled.div`
  display: flex;
  align-items: center;

  & > div {
    min-width: 200px;
    margin-right: 12px;
  }
`;

export const BorderRow = styled(Row)`
  border-radius: 4px 4px 0 0;
  background-color: #ffffff;
  border: 1px solid ${({ theme }) => theme.palette.accents_5};
  box-shadow: 0 4px 8px 0 rgba(36, 46, 66, 0.2);
`;

export const PlacementConfirm = styled.div`
  & > div {
    position: static;
    margin: 0;
    border-radius: 0 0 4px 4px;
  }
`;

export const SelectFormItem = styled(Select)`
  width: 100%;
`;
