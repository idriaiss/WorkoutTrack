import { PlusCircle, Timer, BarChart3, History } from "lucide-react";

type Tab = "workout" | "timer" | "stats" | "history";

interface NavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: "workout" as Tab, label: "Log Workout", icon: PlusCircle },
    { id: "timer" as Tab, label: "Timer", icon: Timer },
    { id: "stats" as Tab, label: "Statistics", icon: BarChart3 },
    { id: "history" as Tab, label: "History", icon: History },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <Icon className="w-4 h-4 mr-2 inline" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}