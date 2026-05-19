import { useReconnectPending } from '../../../../../../../lib/reconnect-tracker';
import { useSelector } from '../../../../../../../redux/store';
import { ConnectButton, DisconnectButton } from '../';

export function ConnectionActionButton() {
  const tunnelState = useSelector((state) => state.connection.status.state);
  const reconnectPending = useReconnectPending();

  // Suppress the transient `disconnected` frame the daemon emits between
  // `disconnecting` and `connecting` during a reconnect — without this the
  // button briefly flips to green between two red renders.
  if (reconnectPending && (tunnelState === 'disconnected' || tunnelState === 'disconnecting')) {
    return <DisconnectButton />;
  }

  if (tunnelState === 'disconnected' || tunnelState === 'disconnecting') {
    return <ConnectButton disabled={tunnelState === 'disconnecting'} />;
  } else {
    return <DisconnectButton />;
  }
}
