import {
  type CustomLists,
  IRelayList,
  IWireguardEndpointData,
  type Recents,
} from '../../src/shared/daemon-rpc-types';

const wireguardEndpointData: IWireguardEndpointData = {
  portRanges: [],
  udp2tcpPorts: [],
};

// VPN.vu server list — 12 servers across 11 countries, mock data for design review
const relayList: IRelayList = {
  countries: [
    {
      name: 'Brasil',
      code: 'br',
      cities: [
        {
          name: 'São Paulo',
          code: 'sao',
          latitude: -23.5505,
          longitude: -46.6333,
          relays: [
            {
              hostname: 'vpnvu-br-sao-001',
              provider: 'vpnvu',
              ipv4AddrIn: '177.10.0.1',
              includeInCountry: true,
              active: true,
              weight: 100,
              owned: true,
              daita: true,
              lwo: true,
            },
          ],
        },
        {
          name: 'Rio de Janeiro',
          code: 'rio',
          latitude: -22.9068,
          longitude: -43.1729,
          relays: [
            {
              hostname: 'vpnvu-br-rio-001',
              provider: 'vpnvu',
              ipv4AddrIn: '177.10.0.2',
              includeInCountry: true,
              active: true,
              weight: 80,
              owned: true,
              daita: true,
              lwo: false,
            },
          ],
        },
      ],
    },
    {
      name: 'Estados Unidos',
      code: 'us',
      cities: [
        {
          name: 'Nova York',
          code: 'nyc',
          latitude: 40.7128,
          longitude: -74.006,
          relays: [
            {
              hostname: 'vpnvu-us-nyc-001',
              provider: 'vpnvu',
              ipv4AddrIn: '198.51.100.1',
              includeInCountry: true,
              active: true,
              weight: 90,
              owned: true,
              daita: true,
              lwo: false,
            },
          ],
        },
        {
          name: 'Los Angeles',
          code: 'lax',
          latitude: 34.0522,
          longitude: -118.2437,
          relays: [
            {
              hostname: 'vpnvu-us-lax-001',
              provider: 'vpnvu',
              ipv4AddrIn: '198.51.100.2',
              includeInCountry: true,
              active: true,
              weight: 80,
              owned: true,
              daita: true,
              lwo: false,
            },
          ],
        },
      ],
    },
    {
      name: 'Reino Unido',
      code: 'gb',
      cities: [
        {
          name: 'Londres',
          code: 'lon',
          latitude: 51.5074,
          longitude: -0.1278,
          relays: [
            {
              hostname: 'vpnvu-gb-lon-001',
              provider: 'vpnvu',
              ipv4AddrIn: '203.0.113.1',
              includeInCountry: true,
              active: true,
              weight: 70,
              owned: true,
              daita: true,
              lwo: false,
            },
          ],
        },
      ],
    },
    {
      name: 'Alemanha',
      code: 'de',
      cities: [
        {
          name: 'Frankfurt',
          code: 'fra',
          latitude: 50.1109,
          longitude: 8.6821,
          relays: [
            {
              hostname: 'vpnvu-de-fra-001',
              provider: 'vpnvu',
              ipv4AddrIn: '203.0.113.2',
              includeInCountry: true,
              active: true,
              weight: 95,
              owned: true,
              daita: true,
              lwo: true,
            },
          ],
        },
      ],
    },
    {
      name: 'Países Baixos',
      code: 'nl',
      cities: [
        {
          name: 'Amsterdã',
          code: 'ams',
          latitude: 52.3676,
          longitude: 4.9041,
          relays: [
            {
              hostname: 'vpnvu-nl-ams-001',
              provider: 'vpnvu',
              ipv4AddrIn: '203.0.113.3',
              includeInCountry: true,
              active: true,
              weight: 75,
              owned: true,
              daita: true,
              lwo: false,
            },
          ],
        },
      ],
    },
    {
      name: 'Suécia',
      code: 'se',
      cities: [
        {
          name: 'Estocolmo',
          code: 'sto',
          latitude: 59.3293,
          longitude: 18.0686,
          relays: [
            {
              hostname: 'vpnvu-se-sto-001',
              provider: 'vpnvu',
              ipv4AddrIn: '203.0.113.4',
              includeInCountry: true,
              active: true,
              weight: 75,
              owned: true,
              daita: true,
              lwo: false,
            },
          ],
        },
      ],
    },
    {
      name: 'Suíça',
      code: 'ch',
      cities: [
        {
          name: 'Zurique',
          code: 'zur',
          latitude: 47.3769,
          longitude: 8.5417,
          relays: [
            {
              hostname: 'vpnvu-ch-zur-001',
              provider: 'vpnvu',
              ipv4AddrIn: '203.0.113.5',
              includeInCountry: true,
              active: true,
              weight: 70,
              owned: true,
              daita: true,
              lwo: false,
            },
          ],
        },
      ],
    },
    {
      name: 'Japão',
      code: 'jp',
      cities: [
        {
          name: 'Tóquio',
          code: 'tyo',
          latitude: 35.6762,
          longitude: 139.6503,
          relays: [
            {
              hostname: 'vpnvu-jp-tyo-001',
              provider: 'vpnvu',
              ipv4AddrIn: '203.0.113.6',
              includeInCountry: true,
              active: true,
              weight: 75,
              owned: true,
              daita: true,
              lwo: false,
            },
          ],
        },
      ],
    },
    {
      name: 'Singapura',
      code: 'sg',
      cities: [
        {
          name: 'Singapura',
          code: 'sin',
          latitude: 1.3521,
          longitude: 103.8198,
          relays: [
            {
              hostname: 'vpnvu-sg-sin-001',
              provider: 'vpnvu',
              ipv4AddrIn: '203.0.113.7',
              includeInCountry: true,
              active: true,
              weight: 70,
              owned: true,
              daita: true,
              lwo: false,
            },
          ],
        },
      ],
    },
    {
      name: 'Canadá',
      code: 'ca',
      cities: [
        {
          name: 'Toronto',
          code: 'tor',
          latitude: 43.6532,
          longitude: -79.3832,
          relays: [
            {
              hostname: 'vpnvu-ca-tor-001',
              provider: 'vpnvu',
              ipv4AddrIn: '203.0.113.8',
              includeInCountry: true,
              active: true,
              weight: 70,
              owned: true,
              daita: true,
              lwo: false,
            },
          ],
        },
      ],
    },
  ],
};

const customLists: CustomLists = [
  {
    id: 'custom-list-1',
    name: 'Custom List 1',
    locations: [],
  },
];

const recents: Recents = [
  {
    type: 'singlehop',
    location: {
      country: relayList.countries[0].code,
    },
  },
  {
    type: 'singlehop',
    location: {
      customList: customLists[0].id,
    },
  },
  {
    type: 'multihop',
    entry: {
      country: relayList.countries[0].code,
    },
    exit: {
      country: relayList.countries[0].code,
    },
  },
];

export const mockData = {
  relayList,
  wireguardEndpointData,
  customLists,
  recents,
};
