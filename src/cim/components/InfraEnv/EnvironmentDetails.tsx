import * as React from 'react';
import {
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
  Spinner,
  Title,
  TitleSizes,
} from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationTriangleIcon, PencilAltIcon } from '@patternfly/react-icons';
import { global_palette_green_500 as okColor } from '@patternfly/react-tokens/dist/js/global_palette_green_500';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens/dist/js/global_warning_color_100';

import { LabelValue } from '../../../common';
import { InfraEnvK8sResource, ConfigMapK8sResource, SecretK8sResource } from '../../types';
import { AGENT_LOCATION_LABEL_KEY } from '../common';
import MinimalHWRequirements from '../Agent/MinimalHWRequirements';
import EditPullSecretModal, { EditPullSecretModalProps } from '../modals/EditPullSecretModal';
import EditSSHKeyModal, { EditSSHKeyModalProps } from '../modals/EditSSHKeyModal';
import EditNtpSourcesModal, { EditNtpSourcesModalProps } from '../modals/EditNtpSourcesModal';

type EditItemProps = {
  title: string;
  onEdit: VoidFunction;
  isLoading?: boolean;
  isWarning?: boolean;
};

const EditItem: React.FC<EditItemProps> = ({ title, onEdit, isLoading, isWarning }) => {
  let icon = <CheckCircleIcon color={okColor.value} />;
  if (isLoading) {
    icon = <Spinner isSVG size="md" />;
  } else if (isWarning) {
    icon = <ExclamationTriangleIcon color={warningColor.value} />;
  }
  return (
    <div>
      {icon}
      &nbsp;{title}&nbsp;
      <Button variant="plain" onClick={onEdit}>
        <PencilAltIcon />
      </Button>
    </div>
  );
};

type EnvironmentDetailsProps = {
  infraEnv: InfraEnvK8sResource;
  fetchSecret: (namespace: string, name: string) => Promise<SecretK8sResource>;
  onEditPullSecret: EditPullSecretModalProps['onSubmit'];
  onEditSSHKey: EditSSHKeyModalProps['onSubmit'];
  onEditNtpSources: EditNtpSourcesModalProps['onSubmit'];
  hasAgents: boolean;
  hasBMHs: boolean;
  aiConfigMap?: ConfigMapK8sResource;
};

const EnvironmentDetails: React.FC<EnvironmentDetailsProps> = ({
  infraEnv,
  aiConfigMap,
  fetchSecret,
  onEditPullSecret,
  onEditSSHKey,
  onEditNtpSources,
  hasAgents,
  hasBMHs,
}) => {
  const [editPullSecret, setEditPullSecret] = React.useState(false);
  const [editSSHKey, setEditSSHKey] = React.useState(false);
  const [editNtpSources, setEditNtpSources] = React.useState(false);
  const [pullSecret, setPullSecret] = React.useState<SecretK8sResource>();
  const [pullSecretError, setPullSecretError] = React.useState<string>();
  const [pullSecretLoading, setPullSecretLoading] = React.useState(true);

  const namespace = infraEnv.metadata?.namespace ?? '';
  const pullSecretName = infraEnv.spec?.pullSecretRef?.name ?? '';

  React.useEffect(() => {
    const fetch = async () => {
      try {
        if (namespace && pullSecretName) {
          const result = await fetchSecret(namespace, pullSecretName);
          setPullSecret(result);
        }
      } catch (err) {
        setPullSecret(undefined);
        // eslint-disable-next-line
        if ((err as any).code !== 404) {
          setPullSecretError((err as Error).message || 'Could not fetch pull secret');
        }
      } finally {
        setPullSecretLoading(false);
      }
    };
    fetch();
  }, [namespace, pullSecretName, fetchSecret, editPullSecret]);
  return (
    <>
      <Grid hasGutter>
        <GridItem span={12}>
          <Title headingLevel="h1" size={TitleSizes.lg}>
            Environment details
          </Title>
        </GridItem>
        <GridItem span={6}>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>Infrastructure Environment name</DescriptionListTerm>
              <DescriptionListDescription>{infraEnv.metadata?.name}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Location</DescriptionListTerm>
              <DescriptionListDescription>
                {infraEnv.metadata?.labels?.[AGENT_LOCATION_LABEL_KEY] ?? 'No location'}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Labels</DescriptionListTerm>
              <DescriptionListDescription>
                {Object.keys(infraEnv.metadata?.labels || {}).map((k) => (
                  <LabelValue key={k} value={`${k}=${infraEnv.metadata?.labels?.[k]}`} />
                ))}
              </DescriptionListDescription>
            </DescriptionListGroup>
            {infraEnv.metadata?.creationTimestamp && (
              <DescriptionListGroup>
                <DescriptionListTerm>Created at</DescriptionListTerm>
                <DescriptionListDescription>
                  {new Date(infraEnv.metadata.creationTimestamp).toString()}
                </DescriptionListDescription>
              </DescriptionListGroup>
            )}
          </DescriptionList>
        </GridItem>
        <GridItem span={6}>
          <DescriptionList>
            {infraEnv.spec?.proxy && (
              <>
                <DescriptionListGroup>
                  <DescriptionListTerm>HTTP Proxy URL</DescriptionListTerm>
                  <DescriptionListDescription>
                    {infraEnv.spec.proxy.httpProxy}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>HTTPS Proxy URL</DescriptionListTerm>
                  <DescriptionListDescription>
                    {infraEnv.spec.proxy.httpsProxy}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>No proxy domains</DescriptionListTerm>
                  <DescriptionListDescription>
                    {infraEnv.spec.proxy.noProxy}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              </>
            )}
            <DescriptionListGroup>
              <DescriptionListTerm>Secret and keys</DescriptionListTerm>
              <DescriptionListDescription>
                <>
                  <EditItem
                    title="Pull secret"
                    onEdit={() => setEditPullSecret(true)}
                    isLoading={pullSecretLoading}
                    isWarning={!pullSecret}
                  />
                  <EditItem
                    title="SSH public key"
                    onEdit={() => setEditSSHKey(true)}
                    isWarning={!infraEnv.spec?.sshAuthorizedKey}
                  />
                  <EditItem title="NTP sources" onEdit={() => setEditNtpSources(true)} />
                </>
              </DescriptionListDescription>
            </DescriptionListGroup>
            {aiConfigMap && (
              <DescriptionListGroup>
                <DescriptionListDescription>
                  <MinimalHWRequirements aiConfigMap={aiConfigMap} />
                </DescriptionListDescription>
              </DescriptionListGroup>
            )}
          </DescriptionList>
        </GridItem>
      </Grid>
      <EditPullSecretModal
        isOpen={editPullSecret}
        onClose={() => setEditPullSecret(false)}
        pullSecret={pullSecret}
        pullSecretError={pullSecretError}
        pullSecretLoading={pullSecretLoading}
        onSubmit={onEditPullSecret}
        infraEnv={infraEnv}
        hasAgents={hasAgents}
        hasBMHs={hasBMHs}
      />
      <EditSSHKeyModal
        isOpen={editSSHKey}
        onClose={() => setEditSSHKey(false)}
        infraEnv={infraEnv}
        onSubmit={onEditSSHKey}
        hasAgents={hasAgents}
        hasBMHs={hasBMHs}
      />
      <EditNtpSourcesModal
        isOpen={editNtpSources}
        onClose={() => setEditNtpSources(false)}
        infraEnv={infraEnv}
        onSubmit={onEditNtpSources}
      />
    </>
  );
};

export default EnvironmentDetails;
