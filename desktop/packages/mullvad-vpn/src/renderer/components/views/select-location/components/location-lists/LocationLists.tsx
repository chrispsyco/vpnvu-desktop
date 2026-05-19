import { useRecents } from '../../../../../features/locations/hooks';
import type { LocationType } from '../../../../../features/locations/types';
import { Expandable } from '../../../../../lib/components/expandable';
import { FlexColumn } from '../../../../../lib/components/flex-column';
import { CountryLocations } from '../country-locations';
import { NoSearchResult } from '../no-search-result';
import { RecentLocations } from '../recent-locations';
import { useHasSearched, useHasSearchedLocations } from './hooks';
import { LocationListsProvider } from './LocationListsContext';

export type LocationsListsProps = React.PropsWithChildren & {
  type: LocationType;
};

/**
 * Custom lists (`<CustomListLocations />`) intencionalmente removidas no v1
 * do VPN.vu — Chris pediu pra cortar a seção da picker enquanto a feature
 * não tem espaço no produto. Pra reativar, re-importar `CustomListLocations`
 * + `useHasCustomLists` e adicionar ao FlexColumn entre Recents e Countries.
 */
export function LocationLists(props: LocationsListsProps) {
  const { hasRecents } = useRecents();
  const hasSearched = useHasSearched();
  const hasSearchedLocations = useHasSearchedLocations();

  const showRecentLocations = !hasSearched && hasRecents;
  const showCountryLocations = !hasSearched || hasSearchedLocations;
  const showNoSearchResult = hasSearched && !showCountryLocations && !showRecentLocations;

  return (
    <LocationListsProvider {...props}>
      <Expandable expanded={showRecentLocations}>
        <Expandable.Content>
          <RecentLocations />
        </Expandable.Content>
      </Expandable>
      <FlexColumn gap="large">
        {showCountryLocations && <CountryLocations />}
        {showNoSearchResult && <NoSearchResult />}
      </FlexColumn>
    </LocationListsProvider>
  );
}
