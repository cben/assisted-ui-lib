import React from 'react';
import * as Yup from 'yup';
import {
  Button,
  ButtonVariant,
  Form,
  ModalBoxBody,
  ModalBoxFooter,
  AlertVariant,
  Alert,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { Formik, FormikHelpers } from 'formik';
import { ImageCreateParams, ImageType, Proxy } from '../../api';
import {
  httpProxyValidationSchema,
  noProxyValidationSchema,
  sshPublicKeyValidationSchema,
  LoadingState,
} from '../../../common/components/ui';
import { ProxyFieldsType } from '../../types';
import ProxyFields from './ProxyFields';
import UploadSSH from './UploadSSH';
import DiscoveryImageTypeControlGroup from './DiscoveryImageTypeControlGroup';
import { OCP_STATIC_IP_DOC } from '../../config/constants';

export const StaticIPInfo: React.FC = () => (
  <Alert
    title="To use static network configuration, follow the steps listed in the documentation."
    isInline
    variant="info"
  >
    <Button
      variant="link"
      icon={<ExternalLinkAltIcon />}
      iconPosition="right"
      isInline
      onClick={() => window.open(OCP_STATIC_IP_DOC, '_blank', 'noopener')}
    >
      View documentation
    </Button>
  </Alert>
);

export type DiscoveryImageFormValues = ImageCreateParams & ProxyFieldsType;

const validationSchema = Yup.lazy<DiscoveryImageFormValues>((values) =>
  Yup.object<DiscoveryImageFormValues>().shape({
    sshPublicKey: sshPublicKeyValidationSchema,
    httpProxy: httpProxyValidationSchema(values, 'httpsProxy'),
    httpsProxy: httpProxyValidationSchema(values, 'httpProxy'), // share the schema, httpS is currently not supported
    noProxy: noProxyValidationSchema,
  }),
);

type DiscoveryImageConfigFormProps = Proxy & {
  onCancel: () => void;
  handleSubmit: (
    values: DiscoveryImageFormValues,
    formikActions: FormikHelpers<DiscoveryImageFormValues>,
  ) => Promise<void>;
  hasDHCP?: boolean;
  hideDiscoveryImageType?: boolean;
  sshPublicKey?: string;
  imageType?: ImageType;
};

export const DiscoveryImageConfigForm: React.FC<DiscoveryImageConfigFormProps> = ({
  handleSubmit,
  onCancel,
  sshPublicKey,
  httpProxy,
  httpsProxy,
  noProxy,
  imageType,
  hideDiscoveryImageType,
  hasDHCP,
}) => {
  const initialValues: DiscoveryImageFormValues = {
    sshPublicKey: sshPublicKey || '',
    httpProxy: httpProxy || '',
    httpsProxy: httpsProxy || '',
    noProxy: noProxy || '',
    enableProxy: !!(httpProxy || httpsProxy || noProxy),
    imageType: imageType || 'full-iso',
  };

  return (
    <Formik
      initialValues={initialValues}
      initialStatus={{ error: null }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ submitForm, isSubmitting, status }) => {
        return isSubmitting ? (
          <LoadingState
            content="Discovery image is being prepared, this might take a few seconds."
            secondaryActions={[
              <Button key="close" variant={ButtonVariant.secondary} onClick={onCancel}>
                Cancel
              </Button>,
            ]}
          />
        ) : (
          <>
            <ModalBoxBody>
              <Stack hasGutter>
                {hasDHCP === false && (
                  <StackItem>
                    <StaticIPInfo />
                  </StackItem>
                )}
                <StackItem>
                  <Form>
                    {status?.error && (
                      <Alert variant={AlertVariant.danger} title={status.error.title} isInline>
                        {status.error.message}
                      </Alert>
                    )}
                    {!hideDiscoveryImageType && <DiscoveryImageTypeControlGroup />}
                    <UploadSSH />
                    <ProxyFields />
                  </Form>
                </StackItem>
              </Stack>
            </ModalBoxBody>
            <ModalBoxFooter>
              <Button key="submit" onClick={submitForm}>
                Generate Discovery ISO
              </Button>
              <Button key="cancel" variant="link" onClick={onCancel}>
                Cancel
              </Button>
            </ModalBoxFooter>
          </>
        );
      }}
    </Formik>
  );
};
