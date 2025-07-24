import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Video, 
  Users, 
  Target, 
  Zap, 
  UserCheck,
  Settings
} from "lucide-react";

const navigation = [
  {
    name: "Main",
    items: [
      { name: "Dashboard", href: "/", icon: BarChart3 },
      { name: "Video Library", href: "/videos", icon: Video },
      { name: "Team Management", href: "/teams", icon: Users },
    ],
  },
  {
    name: "Analysis",
    items: [
      { name: "Face-Off Analysis", href: "/analysis/faceoffs", icon: Target },
      { name: "Transition Intelligence", href: "/analysis/transitions", icon: Zap },
      { name: "Player Evaluation", href: "/analysis/players", icon: UserCheck },
    ],
  },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-card shadow-soft border-r border-border hidden lg:block">
      <div className="p-4 lg:p-6">
        <div className="space-y-6">
          {navigation.map((section) => (
            <div key={section.name}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {section.name}
              </h3>
              <nav className="space-y-2">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  
                  return (
                    <Link key={item.name} href={item.href}>
                      <span
                        className={cn(
                          "flex items-center px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors",
                          isActive
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
          
          <div className="pt-6 border-t border-border">
            <Link href="/settings">
              <span className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg cursor-pointer transition-colors">
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </span>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
