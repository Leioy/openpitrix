import styled from 'styled-components';

export const DefaultAvatar = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
  width: 48px;
  height: 48px;
  background-color: ${({ theme }) => theme.palette.accents_1};
  border-radius: 4px;
  font-size: 24px;
  line-height: 24px;
  font-weight: bold;
`;

export const ImageAvatar = styled.img`
  max-width: 100%;
  max-height: 100%;
  vertical-align: middle;
`;
