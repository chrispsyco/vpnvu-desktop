import { Switch, SwitchProps } from '../../../../lib/components/switch';
import { useEnableSystemNotifications } from '../../hooks';

export type NotificationSwitchProps = SwitchProps;

/**
 * Wraps the generic <Switch /> primitive with the renderer's
 * `useEnableSystemNotifications` redux/IPC hook so this toggle reads and
 * writes the persisted GUI setting in a single place.
 *
 * Visually identical to any other <Switch />; the VPN.vu "Batch 1" styling
 * (44x26 track, blue80 fill, cyan glow on, white thumb) lives in
 * `lib/components/switch/components/switch-thumb/SwitchInput.tsx` and is
 * inherited automatically. Nothing visual is overridden here.
 */
function NotificationsSwitch({ children, ...props }: NotificationSwitchProps) {
  const { enableSystemNotifications, setEnableSystemNotifications } =
    useEnableSystemNotifications();

  return (
    <Switch
      checked={enableSystemNotifications}
      onCheckedChange={setEnableSystemNotifications}
      {...props}>
      {children}
    </Switch>
  );
}

const NotificationSwitchNamespace = Object.assign(NotificationsSwitch, {
  Label: Switch.Label,
  Input: Switch.Input,
  Trigger: Switch.Trigger,
});

export { NotificationSwitchNamespace as NotificationsSwitch };
