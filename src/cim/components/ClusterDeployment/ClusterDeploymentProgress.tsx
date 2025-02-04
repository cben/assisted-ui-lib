import React from 'react';
import ClusterProgress from '../../../common/components/clusterDetail/ClusterProgress';
import { AgentK8sResource } from '../../types/k8s/agent';
import { AgentClusterInstallK8sResource } from '../../types/k8s/agent-cluster-install';
import { ClusterDeploymentK8sResource } from '../../types/k8s/cluster-deployment';
import { EventListFetchProps } from '../../../common';
import { getAICluster } from '../helpers/toAssisted';

type ClusterDeploymentProgressProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  onFetchEvents: EventListFetchProps['onFetchEvents'];
  fallbackEventsURL?: string;
};

const ClusterDeploymentProgress = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  onFetchEvents,
  fallbackEventsURL,
}: ClusterDeploymentProgressProps) => {
  const cluster = getAICluster({ clusterDeployment, agentClusterInstall, agents });
  return (
    <ClusterProgress
      totalPercentage={agentClusterInstall.status?.progress?.totalPercentage || 0}
      cluster={cluster}
      onFetchEvents={onFetchEvents}
      fallbackEventsURL={fallbackEventsURL}
    />
  );
};

export default ClusterDeploymentProgress;
