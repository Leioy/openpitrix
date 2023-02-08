import styled from 'styled-components';
import { Row } from '@kubed/components';

export const FormWrapper = styled(Row)`
  width: 1280px;
  padding: 32px 24px;
  margin: 0 auto;
  margin-bottom: 0 !important;
  height: calc(100vh - 280px);

  button {
    width: 100%;
  }
`;

export const StepsWrapper = styled.div`
  background-color: ${({ theme }) => theme.palette.accents_1};
`;
