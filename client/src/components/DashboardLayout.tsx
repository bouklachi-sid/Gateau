import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { CalendarDays, CakeSlice, FileText, History, Image, LayoutDashboard, LogOut, Menu, Settings, Sparkles } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

const menuItems = [
  { icon: LayoutDashboard, label: "Vue d’ensemble", path: "/" },
  { icon: CakeSlice, label: "Atelier produits", path: "/studio" },
  { icon: CalendarDays, label: "Calendrier", path: "/calendar" },
  { icon: FileText, label: "Contenus", path: "/content" },
  { icon: Image, label: "Médiathèque", path: "/media" },
  { icon: History, label: "Journal", path: "/activity" },
  { icon: Settings, label: "Réglages", path: "/settings" },
];

const SIDEBAR_WIDTH_KEY = "atelier-gateaux-sidebar-width";
const DEFAULT_WIDTH = 272;
const MIN_WIDTH = 224;
const MAX_WIDTH = 360;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => Number(localStorage.getItem(SIDEBAR_WIDTH_KEY)) || DEFAULT_WIDTH);
  const { loading, user } = useAuth();

  useEffect(() => localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth)), [sidebarWidth]);
  if (loading) return <DashboardLayoutSkeleton />;
  if (!user) {
    return (
      <main className="min-h-screen bg-[#f8f4ed] px-6 py-12 text-[#302018]">
        <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center rounded-[2rem] border border-[#e6d8c5] bg-[#fffdf9] p-10 shadow-[0_30px_80px_rgba(92,58,33,.12)]">
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5a2b1b] text-white"><CakeSlice className="h-7 w-7" /></div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[.22em] text-[#ae6942]">Espace privé</p>
          <h1 className="font-display text-4xl leading-tight">Le studio de votre pâtisserie.</h1>
          <p className="mt-4 text-sm leading-6 text-[#715e52]">Connectez-vous pour composer, mettre en scène et programmer vos contenus Facebook en toute sécurité.</p>
          <Button onClick={() => startLogin()} className="mt-8 h-12 rounded-xl bg-[#5a2b1b] text-white hover:bg-[#743b26]">Accéder à mon espace</Button>
        </div>
      </main>
    );
  }
  return (
    <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}>
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}

function DashboardLayoutContent({ children, setSidebarWidth }: { children: React.ReactNode; setSidebarWidth: (value: number) => void }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => item.path === location);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      if (!isResizing) return;
      const left = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const next = event.clientX - left;
      if (next >= MIN_WIDTH && next <= MAX_WIDTH) setSidebarWidth(next);
    };
    const onUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      document.body.style.cursor = "col-resize";
    }
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div ref={sidebarRef} className="relative">
        <Sidebar collapsible="icon" className="border-r border-[#eadfce] bg-[#fffdf9]" disableTransition={isResizing}>
          <SidebarHeader className="px-3 py-5">
            <div className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:justify-center">
              <button onClick={toggleSidebar} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f4ebe0] text-[#5a2b1b] transition hover:bg-[#ead4bc]" aria-label="Réduire la navigation"><Menu className="h-4 w-4" /></button>
              <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="font-display text-lg leading-none text-[#4c2517]">Douceur Studio</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[.18em] text-[#b06a44]">Algérie</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-3 py-4">
            <SidebarMenu className="gap-1">
              {menuItems.map(item => {
                const active = item.path === location;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton isActive={active} onClick={() => setLocation(item.path)} tooltip={item.label} className={`h-11 rounded-xl px-3 ${active ? "bg-[#5a2b1b] text-white hover:bg-[#5a2b1b] hover:text-white" : "text-[#725f51] hover:bg-[#f6eee5] hover:text-[#4c2517]"}`}>
                      <item.icon className="h-4 w-4" /><span className="font-medium">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
            <div className="mx-2 mt-8 rounded-2xl bg-[#f6eee5] p-4 text-[#6a4b39] group-data-[collapsible=icon]:hidden">
              <Sparkles className="mb-3 h-4 w-4 text-[#c17145]" />
              <p className="text-xs font-semibold">Mise en scène protégée</p>
              <p className="mt-1 text-xs leading-5">Le gâteau est conservé ; seuls le décor et la lumière évoluent.</p>
            </div>
          </SidebarContent>
          <SidebarFooter className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-[#f6eee5] group-data-[collapsible=icon]:justify-center">
                  <Avatar className="h-9 w-9 border border-[#e2d1bd]"><AvatarFallback className="bg-[#5a2b1b] text-xs text-white">{user?.name?.slice(0, 1).toUpperCase() || "P"}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden"><p className="truncate text-sm font-medium text-[#4c2517]">{user?.name || "Propriétaire"}</p><p className="mt-0.5 truncate text-xs text-[#967766]">Espace pâtisserie</p></div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end"><DropdownMenuItem onClick={logout} className="text-destructive"><LogOut className="mr-2 h-4 w-4" />Se déconnecter</DropdownMenuItem></DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-[#c17145]/25 group-data-[collapsible=icon]:hidden" onMouseDown={() => state !== "collapsed" && setIsResizing(true)} />
      </div>
      <SidebarInset className="bg-[#f8f4ed]">
        {isMobile && <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#eadfce] bg-[#fffdf9]/95 px-4 backdrop-blur"><div className="flex items-center gap-3"><SidebarTrigger className="rounded-xl" /><span className="font-display text-lg text-[#4c2517]">{activeMenuItem?.label || "Douceur Studio"}</span></div></header>}
        <main className="min-h-screen p-4 md:p-8">{children}</main>
      </SidebarInset>
    </>
  );
}
