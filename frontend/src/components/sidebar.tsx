import { CircleDot, FileText, LayoutDashboard, Menu, ShieldAlert } from "lucide-react";

export type SidebarItem = "dashboard" | "invoices" | "error-report" | "prompts";

const navItems: Array<{ key: SidebarItem; label: string; Icon: typeof LayoutDashboard }> = [
  { key: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { key: "invoices", label: "Invoices", Icon: FileText },
  { key: "error-report", label: "Error Report", Icon: ShieldAlert },
  { key: "prompts", label: "Prompts", Icon: CircleDot },
];

type SidebarProps = {
  activeItem: SidebarItem;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onItemSelect: (item: SidebarItem) => void;
};

export function Sidebar({
  activeItem,
  collapsed,
  onToggleCollapsed,
  onItemSelect,
}: SidebarProps) {
  return (
    <aside className="sticky top-4 h-[calc(100vh-2rem)] border-r border-white/5 bg-[#0C0D10] p-4">
      <div className="mb-8 flex items-start justify-between">
        <div className={collapsed ? "hidden" : "block"}>
          <p className="text-2xl font-semibold text-[#A9A4FF]">InvoiceIQ</p>
        </div>
        <button
          type="button"
          aria-label="Toggle sidebar"
          onClick={onToggleCollapsed}
          className="mt-1 grid size-8 place-items-center rounded-md text-white/65 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Menu className="size-4" />
        </button>
      </div>

      <nav className="space-y-2">
        {navItems.map(({ key, label, Icon }) => {
          const isActive = activeItem === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onItemSelect(key)}
              className={`flex items-center gap-3 rounded-sm px-3 py-2 text-sm ${
                isActive
                  ? "border-r-2 border-r-[#7D78FF] bg-white/[0.04] text-[#B7B3FF]"
                  : "text-white/55"
              }`}
            >
              <Icon className="size-4" />
              {!collapsed ? label : null}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
