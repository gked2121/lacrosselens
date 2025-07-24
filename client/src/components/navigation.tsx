import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VideoUpload from "@/components/video-upload";
import { Home, Video, BarChart3, Upload, User, LogOut } from "lucide-react";

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const typedUser = user as any;
  const [location] = useLocation();

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/videos", label: "Video Library", icon: Video },
    { href: "/analysis", label: "Analysis", icon: BarChart3 },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50" style={{ backgroundColor: 'hsl(var(--background))', borderBottom: '1px solid hsl(var(--border))' }}>
      <div className="container flex h-16 lg:h-20 items-center justify-between px-6 lg:px-8">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4 lg:space-x-6">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'hsl(259 100% 65%)' }}>
                <BarChart3 className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <span className="font-bold text-xl lg:text-2xl" style={{ color: 'hsl(var(--foreground))' }}>
                LacrosseLens
              </span>
              <span className="text-sm px-3 py-1 rounded-full font-semibold ml-2" style={{ backgroundColor: 'hsl(259 100% 65% / 0.1)', color: 'hsl(259 100% 65%)' }}>
                Beta
              </span>
            </div>
          </Link>

          {/* Navigation Links - Desktop Only */}
          <div className="hidden lg:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Upload Button and User Menu */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Upload Video Button */}
          <VideoUpload>
            <Button className="hidden sm:flex items-center gap-2 btn-primary">
              <Upload className="w-5 h-5" />
              <span className="font-semibold">Upload Video</span>
            </Button>
          </VideoUpload>

          <VideoUpload>
            <Button variant="outline" className="sm:hidden btn-outline">
              <Upload className="w-5 h-5" />
            </Button>
          </VideoUpload>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={typedUser?.profileImageUrl || ""} 
                    alt={typedUser?.firstName || typedUser?.email || "User"} 
                  />
                  <AvatarFallback>
                    {typedUser?.firstName ? typedUser.firstName.charAt(0).toUpperCase() : typedUser?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {typedUser?.firstName && typedUser?.lastName 
                      ? `${typedUser.firstName} ${typedUser.lastName}`
                      : typedUser?.firstName || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {typedUser?.email || ""}
                  </p>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild>
                <a href="/api/logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}