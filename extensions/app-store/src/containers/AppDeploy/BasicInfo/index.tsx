import React, { useEffect, useMemo, useState } from 'react';
import { get } from 'lodash';
import { Project } from '@kubed/icons';
import { useStore } from '@kubed/stook';
import { Pattern, workspaceStore, projectStore, getQuery, ProjectDetail } from '@ks-console/shared';
import { Col, FormItem, Row, Form, Input, Field, FormInstance } from '@kubed/components';

import Placement from './Placement';
import { compareVersion } from '../../../utils';
import { fetchFiles } from '../../../store';
import PlacementForm from './Placement/PlacementForm';

import {
  Title,
  TextArea,
  VersionSelector,
  StaticPlacement,
  PlacementContent,
  PlacementFormWrapper,
  PlacementItemWrapper,
} from './styles';
import { useParams } from 'react-router-dom';

const { useNamespaceList } = projectStore;
const { useWorkspaces, useClusters } = workspaceStore;

type Props = {
  form: FormInstance<any>;
  initFormData: DeployFormData;
  patchFormData: (patch: Partial<DeployFormData>) => void;
  initNamespace?: string;
  versions?: LatestAppVersion[];
};

function BasicInfo({ form, initFormData, versions, patchFormData }: Props): JSX.Element {
  const { appId } = useParams();
  const { workspace, cluster, namespace } = getQuery<{
    workspace: string;
    cluster: string;
    namespace: string;
  }>();
  const [workspaceKey, setWorkspaceKey] = useState<string>(workspace);
  const sortedVersions = useMemo(
    () =>
      (versions || [])
        .map(version => ({
          label: version.name,
          value: version.version_id,
        }))
        .sort((v1, v2) => compareVersion(v2.value, v1.value)),
    [versions],
  );
  // const latestVersion = useMemo(() => sortedVersions[0]?.value, [sortedVersions[0]?.value]);
  const [showForm, setShowForm] = useStore<boolean>('showPlacementForm');
  const { data: workspaces = [], isLoading: workspacesIsLoading } = useWorkspaces(
    { limit: -1, ascending: true },
    ({ items }: any) => {
      if (!workspace) {
        const patchWorkspaces = items
          ?.filter((item: any) => item.metadata.name !== globals.config.systemWorkspace)
          .map((item: any) => ({
            label: item.metadata.name,
            value: item.metadata.name,
          }));
        const patchForm: Partial<DeployFormData> = {
          workspace: get(patchWorkspaces, '[0].value', ''),
        };
        patchFormData(patchForm);
      }
    },
  );
  const clusters = useClusters({ workspace: workspaceKey });
  const { data: namespaces = [], reFetch: reFetchNamespaces } = useNamespaceList<ProjectDetail>({
    workspace: workspaceKey,
    cluster,
    ascending: true,
  });
  const initializing = useMemo<boolean>(() => {
    return workspacesIsLoading;
  }, [workspacesIsLoading]);

  function handleVersionChange(versionId: string): void {
    fetchFiles({ app_id: appId, version_id: versionId }).then(fileDetails =>
      console.log(fileDetails),
    );
  }

  function handleClusterChange(clusterName: string): void {
    reFetchNamespaces({
      workspace: workspaceKey,
      cluster: clusterName,
      ascending: true,
    });
  }

  function handleWorkspaceChange(workspaceName: string): void {
    setWorkspaceKey(workspaceName);
  }

  function submitPlacementForm(data: DeployFormData): void {
    patchFormData(data);
    setShowForm(false);
  }

  // todo: render latest version options tip
  // versionOptionRender = ({ label, value }) => (
  //   <span style={{ display: 'flex', alignItem: 'center' }}>
  //     {label}&nbsp;&nbsp;
  //     {value === this.latestVersion && <Tag type="warning">{t('LATEST_VERSION_SCAP')}</Tag>}
  //   </span>
  // );

  useEffect(() => {
    if (!cluster) {
      const patchClusters = clusters.map((item: any) => ({
        label: item.metadata.name,
        value: item.metadata.name,
        disabled: !item.isReady,
        cluster: item,
      }));
      const patchForm = { cluster: get(patchClusters, '[0].value') };

      patchFormData(patchForm);
    }
  }, [clusters]);

  useEffect(() => {
    if (!namespace) {
      const filterNamespace = namespaces?.filter(
        (item: ProjectDetail) => item.status !== 'Terminating',
      );

      if (filterNamespace) {
        const fetchNamespaces: ValidNamespace[] = filterNamespace?.map((item: ProjectDetail) => ({
          label: item.name,
          value: item.name,
          disabled: item.isFedManaged,
          isFedManaged: item.isFedManaged,
        }));
        const firstValidNamepsace = fetchNamespaces.find((item: ValidNamespace) => !item.disabled);
        const patchForm = { namespace: firstValidNamepsace?.value || '' };

        patchFormData(patchForm);
      }
    }
  }, [namespaces]);

  useEffect(() => {
    form.resetFields();
  }, [initFormData]);

  useEffect(() => {
    return () => {
      setShowForm(false);
    };
  }, []);

  return (
    <>
      <Form form={form} initialValues={initFormData} style={{ paddingRight: '76px' }}>
        <Title>{t('BASIC_INFORMATION')}</Title>
        <Row>
          <Col span={6}>
            <FormItem
              name="name"
              label={t('NAME')}
              help={t('CLUSTER_NAME_DESC')}
              rules={[
                { required: true, message: t('NAME_EMPTY_DESC') },
                {
                  pattern: Pattern.PATTERN_SERVICE_NAME,
                  message: t('INVALID_NAME_DESC', {
                    message: t('CLUSTER_NAME_DESC'),
                  }),
                },
              ]}
            >
              <Input maxLength={53} />
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              label={t('VERSION')}
              name="version_id"
              rules={[{ required: true, message: t('VERSION_EMPTY_DESC') }]}
            >
              <VersionSelector
                options={sortedVersions}
                onChange={handleVersionChange}
                // optionRenderer={versionOptionRender}
                // valueRenderer={versionOptionRender}
              />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <FormItem label={t('DESCRIPTION')} name="description" help={t('DESCRIPTION_DESC')}>
              <TextArea maxLength={256} />
            </FormItem>
          </Col>
        </Row>
        <Title style={{ margin: '12px 8px 32px' }}>{t('LOCATION')}</Title>
        {!namespace && !showForm && (
          <PlacementItemWrapper>
            <FormItem
              name="namespace"
              rules={[
                {
                  required: true,
                  message: t('PROJECT_NOT_SELECT_DESC'),
                },
              ]}
            >
              <Placement
                formData={initFormData}
                initializing={initializing}
                showPlacementForm={() => setShowForm(true)}
              />
            </FormItem>
          </PlacementItemWrapper>
        )}
        {namespace && (
          <StaticPlacement>
            <PlacementContent>
              <Field label={t('WORKSPACE')} value={workspace || '-'} />
              <Field label={t('CLUSTER')} value={cluster || '-'} />
              <Field label={t('PROJECT')} value={namespace} avatar={<Project />} />
            </PlacementContent>
          </StaticPlacement>
        )}
      </Form>
      {!namespace && showForm && (
        <PlacementFormWrapper>
          <PlacementForm
            formData={initFormData}
            workspaces={workspaces}
            clusters={clusters}
            namespaces={namespaces}
            workspace={workspace}
            onCancel={() => setShowForm(false)}
            onOk={submitPlacementForm}
            handleClusterChange={handleClusterChange}
            handleWorkspaceChange={handleWorkspaceChange}
          />
        </PlacementFormWrapper>
      )}
    </>
  );
}

export default BasicInfo;
