import React from 'react';
import { isEmpty } from 'lodash';
import ReactMarkdown from 'react-markdown';

import { AppDetail, Image, LabelText } from '@ks-console/shared';

import BaseInfo from './BaseInfo';

import { PreField, StyledField } from './styles';

type Props = {
  detail?: AppDetail;
  versionName?: string;
};

function InfoDetail({ detail, versionName }: Props): JSX.Element {
  if (!detail) {
    return <></>;
  }

  const screenshots: any[] = [];

  return (
    <>
      <LabelText>{t('BASIC_INFORMATION')}</LabelText>
      <StyledField
        avatar={<Image src={detail.icon} iconLetter={detail.name} iconSize={100} canLoading />}
        value={
          <BaseInfo
            name={detail.name}
            home={detail.home}
            isv={detail.isv}
            versionName={versionName}
          />
        }
        label={
          <PreField value={<pre>{detail.description || '-'}</pre>} label={t('INTRODUCTION')} />
        }
      />
      <LabelText>{t('APP_DESCRIPTION')}</LabelText>
      <ReactMarkdown>{detail.abstraction || t('NONE')}</ReactMarkdown>
      <LabelText>{t('APP_SCREENSHOTS')}</LabelText>
      {isEmpty(screenshots) ? (
        <p>{t('NONE')}</p>
      ) : (
        <ul>
          {screenshots.map((item, index) => (
            <li key={index}>{item /* <Image src={item} /> */}</li>
          ))}
        </ul>
      )}
    </>
  );
}

export default InfoDetail;
