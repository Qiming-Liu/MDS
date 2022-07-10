// component
import Iconify from '../../components/Iconify';

// ----------------------------------------------------------------------

const getIcon = (name) => <Iconify icon={name} width={22} height={22} />;

const navConfig = [
  {
    title: 'index',
    path: '/index/index',
    icon: getIcon('eva:pie-chart-2-fill'),
  },
];

export default navConfig;
