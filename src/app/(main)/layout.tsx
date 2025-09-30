import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/utils/ThemeToggle";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-neutral-50 pr-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 dark:bg-neutral-900">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 hover:bg-neutral-200 dark:hover:bg-gray-800" />
          </div>
          <ThemeToggle />
        </header>
        <div className="flex flex-1 flex-col gap-4 bg-neutral-100 p-4 pt-0 dark:bg-black">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
