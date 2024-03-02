import styled from 'styled-components';
import { Col, Empty } from '@kubed/components';

export const EmptyWrapper = styled(Empty)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 250px;
  padding: 40px 0;
  .empty-title {
    margin-top: 30px;
  }
`;

export const StyledCol = styled(Col)`
  overflow: hidden;
`;
