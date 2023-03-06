import styled from 'styled-components';
import { Form, Select } from '@kubed/components';

// .title {
//   margin-bottom: 20px;
//   font-size: 14px;
//   font-weight: 600;
//   line-height: 1.43;
//   color: $dark-color07;
// }

// .placement {
//   padding: 12px;
//   border-radius: $border-radius;
//   background-color: $card-bg-color;
// }

export const StaticPlacement = styled.div`
  position: relative;
  padding: 12px;
  opacity: 0.7;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.palette.border};
  background-color: #ffffff;
  transition: all 0.3s ease-in-out;
`;

export const PlacementContent = styled.div`
  display: flex;

  & > div {
    min-width: 200px;
    margin-right: 12px;
  }
`;

export const VersionSelector = styled(Select)`
  width: 100%;
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.palette.accents_4};
  background-color: #ffffff;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  font-family: PingFang SC, Lantinghei SC, Helvetica Neue, Helvetica, Arial, Microsoft YaHei,
    微软雅黑, STHeitiSC-Light, simsun, 宋体, WenQuanYi Zen Hei, WenQuanYi Micro Hei, sans-serif;
  font-size: 12px;
  font-weight: 600;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.67;
  letter-spacing: normal;
  color: ${({ theme }) => theme.palette.accents_7};
  -webkit-transition: all 0.3s ease-in-out;
  -o-transition: all 0.3s ease-in-out;
  transition: all 0.3s ease-in-out;
  outline: none;
  caret-color: ${({ theme }) => theme.palette.accents_7};
`;

export const Title = styled.div`
  margin: 0 8px 12px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.43;
  color: ${({ theme }) => theme.palette.accents_8};
`;

const marginRightStyle = 'margin-right: 76px';

export const PlacementItemWrapper = styled.div`
  padding: 12px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.palette.accents_0};
`;

export const StyledForm = styled(Form)`
  ${marginRightStyle}
`;

export const PlacementFormWrapper = styled(PlacementItemWrapper)`
  ${marginRightStyle}
`;
