import { useCallback } from 'react';

import { type ISplitTunnelingApplication } from '../../../../../../../../../../shared/application-types';
import { messages } from '../../../../../../../../../../shared/gettext';
import { Section, SectionTitle } from '../../../../../../../../cell';
import { ApplicationList } from '../../../../../application-list';
import { ApplicationRow } from '../../../../../application-row';
import { useFilteredSplitApplications } from '../../../../hooks';
import { useRemoveApplication } from './hooks';

export function SplitApplicationSection() {
  const filteredSplitApplications = useFilteredSplitApplications();
  const removeApplication = useRemoveApplication();

  const excludedRowRenderer = useCallback(
    (application: ISplitTunnelingApplication) => (
      <ApplicationRow application={application} onRemove={removeApplication} />
    ),
    [removeApplication],
  );

  // `$thin` flips SectionTitle to the Geist Mono kicker style (matches the
  // Figma `.mv-section-title` token: uppercase, tracked-out, muted color).
  const sectionTitle = (
    <SectionTitle $thin>{messages.pgettext('split-tunneling-view', 'Excluded apps')}</SectionTitle>
  );

  return (
    <Section sectionTitle={sectionTitle}>
      <ApplicationList
        data-testid="split-applications"
        applications={filteredSplitApplications}
        rowRenderer={excludedRowRenderer}
      />
    </Section>
  );
}
