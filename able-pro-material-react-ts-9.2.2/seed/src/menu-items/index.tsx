// project import
import samplePage from './sample-page';
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
      if (item.roles && !role) return false;
      return true;
    })
    .map((item) => (item.children ? { ...item, children: filterByRole(item.children as NavItemType[], role) } : item))
    .filter((item) => {
      if ((item.type === 'group' || item.type === 'collapse') && item.children && item.children.length === 0) return false;
      return true;
    });
}

const role = getRole();
const filtered = filterByRole([samplePage, pages, support], role);

const menuItems: { items: NavItemType[] } = {
  items: filtered
};

export default menuItems;
