import React from 'react';
import styled from 'styled-components';

import { strings } from '../../shared/constants';
import { messages } from '../../shared/gettext';
import log from '../../shared/logging';
import { Button } from '../lib/components';
import { FlexColumn } from '../lib/components/flex-column';
import { ErrorView } from './views';

interface IProps {
  children?: React.ReactNode;
}

interface IState {
  hasError: boolean;
}

const Email = styled.span({
  fontWeight: 900,
});

export default class ErrorBoundary extends React.Component<IProps, IState> {
  public state = { hasError: false };

  public componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ hasError: true });

    log.error(
      `The error boundary caught an error: ${error.message}\nError stack: ${
        error.stack || 'Not available'
      }\nComponent stack: ${info.componentStack}`,
    );
  }

  // Resets the boundary so children try to render again. If the underlying
  // issue was transient (a stale prop, a one-off bad render) this brings the
  // previous view back. If it crashes again, the boundary catches it again.
  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  public render() {
    if (this.state.hasError) {
      const reachBackMessage: React.ReactNode[] =
        // TRANSLATORS: The message displayed to the user in case of critical error in the GUI
        // TRANSLATORS: Available placeholders:
        // TRANSLATORS: %(email)s - support email
        messages
          .pgettext('error-boundary-view', 'Something went wrong. Please contact us at %(email)s')
          .split('%(email)s', 2);
      void reachBackMessage.splice(1, 0, <Email>{strings.supportEmail}</Email>);

      return (
        <ErrorView
          settingsUnavailable
          footer={
            <FlexColumn gap="small">
              <Button variant="primary" onClick={this.handleRetry}>
                <Button.Text>
                  {
                    // TRANSLATORS: Button that returns the user to the previous view after a render error.
                    messages.pgettext('error-boundary-view', 'Go back')
                  }
                </Button.Text>
              </Button>
            </FlexColumn>
          }>
          {reachBackMessage}
        </ErrorView>
      );
    } else {
      return this.props.children;
    }
  }
}
