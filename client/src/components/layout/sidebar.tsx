import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BoxIcon,
  HomeIcon,
  LogOutIcon,
  ShirtIcon,
  StoreIcon,
  UsersIcon,
} from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const links = [
    {
      title: "Dashboard",
      icon: HomeIcon,
      href: "/",
      roles: ["admin", "shopkeeper"],
    },
    {
      title: "Products",
      icon: ShirtIcon,
      href: "/products",
      roles: ["admin"],
    },
    {
      title: "Stores",
      icon: StoreIcon,
      href: "/stores",
      roles: ["admin"],
    },
    {
      title: "Users",
      icon: UsersIcon,
      href: "/users",
      roles: ["admin"],
    },
    {
      title: "Stock",
      icon: BoxIcon,
      href: "/stock",
      roles: ["admin", "shopkeeper"],
    },
  ].filter((link) => link.roles.includes(user?.role || ""));

  return (
    <div className={cn("pb-12 border-r", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Inventory
          </h2>
          <div className="space-y-1">
            <ScrollArea>
              <nav className="grid gap-1 px-2">
                {links.map((link) => (
                  <Button
                    key={link.href}
                    variant={location === link.href ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    asChild
                  >
                    <Link to={link.href}>
                      <link.icon className="mr-2 h-4 w-4" />
                      {link.title}
                    </Link>
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </nav>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
