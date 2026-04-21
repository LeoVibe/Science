import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: '主選單', icon: '🏠' },
  { to: '/quiz', label: '答題', icon: '🎯' },
  { to: '/result', label: '結果', icon: '🎉' },
  { to: '/report', label: '學習報告', icon: '📊' },
];

export default function Nav() {
  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-card border shadow-md rounded-full px-2 py-1.5 flex gap-1">
      {links.map(l => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.to === '/'}
          className={({ isActive }) =>
            `px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`
          }
        >
          <span className="mr-1">{l.icon}</span>
          <span className="hidden sm:inline">{l.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
