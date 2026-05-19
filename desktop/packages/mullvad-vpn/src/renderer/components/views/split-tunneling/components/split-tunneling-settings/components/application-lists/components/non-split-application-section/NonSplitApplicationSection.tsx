import { useCallback } from 'react';

import { ISplitTunnelingApplication } from '../../../../../../../../../../shared/application-types';
import { messages } from '../../../../../../../../../../shared/gettext';
import { Section, SectionTitle } from '../../../../../../../../cell';
import { ApplicationList } from '../../../../../application-list';
import { ApplicationRow } from '../../../../../application-row';
import { useAddApplication, useFilteredNonSplitApplications } from '../../../../hooks';
import { useForgetManuallyAddedApplicationAndUpdate } from './hooks';

export function NonSplitApplicationSection() {
  const addApplication = useAddApplication();
  const filteredNonSplitApplications = useFilteredNonSplitApplications();
  const forgetManuallyAddedApplicationAndUpdate = useForgetManuallyAddedApplicationAndUpdate();

  const includedRowRenderer = useCallback(
    (application: ISplitTunnelingApplication) => {
      const onForget = application.deletable ? forgetManuallyAddedApplicationAndUpdate : undefined;
      return (
        <ApplicationRow application={application} onAdd={addApplication} onDelete={onForget} />
      );
    },
    [addApplication, forgetManuallyAddedApplicationAndUpdate],
  );

  // `$thin` flips SectionTitle to the Geist Mono kicker style (matches the
  // Figma `.mv-section-title` token: uppercase, tracked-out, muted color).
  const sectionTitle = (
    <SectionTitle $thin>{messages.pgettext('split-tunneling-view', 'All apps')}</SectionTitle>
  );

  return (
    <Section sectionTitle={sectionTitle}>
      <ApplicationList
        data-testid="non-split-applications"
        applications={filteredNonSplitApplications}
        rowRenderer={includedRowRenderer}
      />
    </Section>
  );
}
