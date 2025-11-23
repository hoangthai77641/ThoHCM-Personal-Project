// project-imports
import applications from './applications';
import widget from './widget';
import formsTables from './forms-tables';
import samplePage from './sample-page';
import chartsMap from './charts-map';
import support from './support';
import pages from './pages';
import { jwtDecode } from 'jwt-decode';

// types
import { NavItemType } from 'types/menu';

// ==============================|| MENU ITEMS ||============================== //

function getRole(): string | undefined {
  try {
    const token = localStorage.getItem('serviceToken');
    if (!token) return undefined;
    const decoded: any = jwtDecode(token);
    return decoded.role;
  } catch {
    return undefined;
  }
}

export function filterByRole(items: NavItemType[], role?: string): NavItemType[] {
  return items
    .filter((item) => {
      if (item.roles && role && !item.roles.includes(role)) return false;
      if (item.roles && !role) return false; // require auth role present
      return true;
    })
    .map((item) => {
      if (item.children) {
        return { ...item, children: filterByRole(item.children as NavItemType[], role) };
      }
      return item;
    })
    .filter((item) => {
      // Remove empty collapses/groups after filtering
      if ((item.type === 'group' || item.type === 'collapse') && item.children && item.children.length === 0) return false;
      return true;
    });
}

const role = getRole();
const allItems = [widget, applications, formsTables, chartsMap, samplePage, pages, support];
const filtered = filterByRole(allItems, role);

const menuItems: { items: NavItemType[] } = {
  items: filtered
};

export default menuItems;
