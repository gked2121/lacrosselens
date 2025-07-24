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
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-14 lg:h-16 items-center justify-between px-4 lg:px-6">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4 lg:space-x-6">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-7 h-7 lg:w-8 lg:h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg lg:text-xl text-foreground">
                LacrosseLens
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
            <Button size="sm" className="hidden sm:flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload Video</span>
            </Button>
          </VideoUpload>

          <VideoUpload>
            <Button size="sm" variant="outline" className="sm:hidden">
              <Upload className="w-4 h-4" />
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