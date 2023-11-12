import React from 'react';
import { isEmpty } from 'lodash';
import ReactMarkdown from 'react-markdown';

import { AppDetail, getBrowserLang, Image, LabelText } from '@ks-console/shared';

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
        avatar={
          <Image
            src={detail.spec.icon}
            iconLetter={detail.metadata.name}
            iconSize={100}
            canLoading
          />
        }
        value={
          <BaseInfo
            name={detail.metadata.name}
            home={detail.spec.appHome}
            isv={detail.metadata.labels?.['kubesphere.io/workspace']}
            versionName={versionName}
          />
        }
        label={
          <PreField
            value={<pre>{detail.spec.description.zh || '-'}</pre>}
            label={t('INTRODUCTION')}
          />
        }
      />
      <LabelText>{t('APP_DESCRIPTION')}</LabelText>
      <ReactMarkdown>{detail.spec.description[getBrowserLang()] || t('NONE')}</ReactMarkdown>
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
