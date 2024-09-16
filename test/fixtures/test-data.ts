import { WidgetServiceDto } from '../../src/widget-services/dto/widget-service.dto';

export const widgetServicesData:Partial<WidgetServiceDto>[] = [
  {
    name: 'Service Z',
    description: 'Description for Service Z',
    widgetVersions: [{ name: 'pippo' }, { name: 'pluto' }],
  },
  {
    name: 'Service B',
    description: 'Description for Service B',
    widgetVersions: [{ name: 'pippo' }, { name: 'pluto' }, { name: 'paperino' }],
  },
  {
    name: 'Service C',
    description: 'Description for Service C',
    widgetVersions: [{ name: 'pippo' }],
  },
  {
    name: 'Service D',
    description: 'Description for Service D',
    widgetVersions: [{ name: 'pippo' }, { name: 'pluto' }, { name: 'paperino' }, {name: 'topolino'}],
  },
  {
    name: 'test 1',
    description: 'palnet test 1',
    widgetVersions: [{ name: 'terra' }, { name: 'plutone' }],
  },
  {
    name: 'test B',
    description: 'satellite test',
    widgetVersions: [{ name: 'luna' }, { name: 'callisto' }],
  },
  {
    name: 'test A',
    description: 'satellite test',
    widgetVersions: [{ name: 'luna' }, { name: 'callisto' }],
  },
  {
    name: '12VersionsTest',
    description: 'a test with more the 10 versions',
    widgetVersions: [{ name: 'luna' }, { name: 'callisto' },
      { name: 'luna1' }, { name: 'callisto1' },
      { name: 'luna2' }, { name: 'callisto2' },
      { name: 'luna3' }, { name: 'callisto3' },
      { name: 'luna4' }, { name: 'callisto4' },
      { name: 'luna5' }, { name: 'callisto5' },
    ],
  },


].map((a, i) => ({...a, numOfVersions: a.widgetVersions.length}));
