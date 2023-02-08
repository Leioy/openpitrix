import React, { useRef, useState, CSSProperties } from 'react';

import { formatImageUrl } from '../../utils';

import { DefaultAvatar, ImageAvatar } from './styles';

type Props = {
  iconSize: number;
  iconLetter?: string;
  src?: string;
  className?: string;
  isBase64Str?: boolean;
  [key: string]: unknown;
};

function Image({
  src,
  iconSize = 32,
  iconLetter = '',
  isBase64Str = false,
  className,
  ...rest
}: Props): JSX.Element {
  const imgRef = useRef<any>();
  const [srcFailed, setSrcFailed] = useState<boolean>(false);
  const imgStr = src ? formatImageUrl(src, isBase64Str) : src;

  if (srcFailed || !imgStr) {
    const letter = iconLetter.substring(0, 1).toLocaleUpperCase();
    const style: CSSProperties = {
      width: `${iconSize}px`,
      height: `${iconSize}px`,
    };

    if (letter) {
      const fontSize = iconSize / 2;
      style.fontSize = `${fontSize}px`;
      style.padding = `${iconSize / 4}px`;
      style.lineHeight = `${fontSize > 12 ? fontSize : 12}px`;

      return (
        <DefaultAvatar style={style} {...rest}>
          {letter}
        </DefaultAvatar>
      );
    }

    return <></>;
  }

  return (
    <ImageAvatar
      src={imgStr}
      data-origin-url={imgStr}
      className={className}
      ref={r => (imgRef.current = r)}
      onError={() => setSrcFailed(true)}
      {...rest}
    />
  );
}

export default Image;
