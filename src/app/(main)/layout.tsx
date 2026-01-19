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
        <header className="fixed top-0 right-0 left-0 z-40 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-white px-4 dark:bg-neutral-900">
          <SidebarTrigger className="md:hidden" />
          <ThemeToggle />
        </header>
        <div className="flex flex-1 flex-col gap-4 bg-neutral-100 pt-16 dark:bg-black">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
