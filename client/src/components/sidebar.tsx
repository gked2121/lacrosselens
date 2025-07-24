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
    <aside className="w-72 hidden lg:block" style={{ backgroundColor: 'hsl(var(--background))', borderRight: '1px solid hsl(var(--border))' }}>
      <div className="p-6 lg:p-8">
        <div className="space-y-8">
          {navigation.map((section) => (
            <div key={section.name}>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'hsl(var(--muted-foreground))', letterSpacing: '0.1em' }}>
                {section.name}
              </h3>
              <nav className="space-y-2">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  const isComingSoon = item.name === "Team Management";
                  
                  if (isComingSoon) {
                    return (
                      <div key={item.name}>
                        <span
                          className="flex items-center justify-between px-4 py-3 text-base font-medium rounded-xl cursor-not-allowed opacity-50"
                        >
                          <div className="flex items-center">
                            <Icon className="w-6 h-6 mr-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
                            <span style={{ color: 'hsl(var(--muted-foreground))' }}>{item.name}</span>
                          </div>
                          <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: 'hsl(259 100% 65% / 0.1)', color: 'hsl(259 100% 65%)' }}>
                            Coming Soon
                          </span>
                        </span>
                      </div>
                    );
                  }
                  
                  return (
                    <Link key={item.name} href={item.href}>
                      <span
                        className={cn(
                          "flex items-center px-4 py-3 text-base font-medium rounded-xl cursor-pointer transition-all duration-200",
                          isActive
                            ? ""
                            : "hover:translate-x-1"
                        )}
                        style={{
                          backgroundColor: isActive ? 'hsl(259 100% 65% / 0.1)' : 'transparent',
                          color: isActive ? 'hsl(259 100% 65%)' : 'hsl(var(--foreground))',
                          borderLeft: isActive ? '3px solid hsl(259 100% 65%)' : '3px solid transparent'
                        }}
                      >
                        <Icon className="w-6 h-6 mr-4" />
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
          
          <div className="pt-8 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
            <Link href="/settings">
              <span className="flex items-center px-4 py-3 text-base font-medium rounded-xl cursor-pointer transition-all duration-200 hover:translate-x-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                <Settings className="w-6 h-6 mr-4" />
                Settings
              </span>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
