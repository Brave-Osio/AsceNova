import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Tooltip from '../ui/Tooltip';

interface SidebarToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const BUTTON =
  'relative h-9 w-9 items-center justify-center rounded-lg border border-brand-border bg-brand-card/90 text-brand-text-secondary shadow-sm backdrop-blur transition-colors duration-150 hover:bg-brand-card-alt hover:text-brand-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60 active:scale-95';

/**
 * The one sidebar collapse/expand control. Rendered at the top-left of the page
 * content (not inside the sidebar), so it floats over the content and rides
 * along the sidebar's edge as it expands and collapses. The two icons
 * crossfade and rotate slightly on toggle.
 */
export default function SidebarToggle({ isCollapsed, onToggle }: SidebarToggleProps) {
  const label = isCollapsed ? 'Expand sidebar' : 'Collapse sidebar';
  return (
    <div className="hidden md:block">
      <Tooltip label={label} side="bottom">
        <button type="button" onClick={onToggle} aria-label={label} aria-expanded={!isCollapsed} className={`flex ${BUTTON}`}>
        <PanelLeftClose
          size={18}
          aria-hidden="true"
          className={`absolute transition-all duration-200 ${isCollapsed ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`}
        />
        <PanelLeftOpen
          size={18}
          aria-hidden="true"
          className={`absolute transition-all duration-200 ${isCollapsed ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`}
        />
        </button>
      </Tooltip>
    </div>
  );
}
