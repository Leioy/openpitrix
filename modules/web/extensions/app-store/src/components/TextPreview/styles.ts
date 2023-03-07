import styled from 'styled-components';
import { Select } from '@kubed/components';

export const TextPreviewWrapper = styled.div`
  padding: 8px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.palette.border};
`;

export const EditorWrapper = styled.div`
  position: relative;
  margin-top: 10px;
  min-height: 500px;
  height: calc(-420px + 100vh);
`;

export const ToolbarWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const FileSelector = styled(Select)`
  width: 376px;
`;

export const OverlayTools = styled.div`
  position: absolute;
  right: 0;
  font-size: 12px;
  padding: 0.5em 1em;
  z-index: 3;
  line-height: 20px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.palette.accents_7};
  margin: 1em;
  cursor: pointer;

  svg {
    color: #ffffff;
  }

  &:hover {
    svg {
      color: ${({ theme }) => theme.palette.colors.green[2]};
    }
  }
`;
