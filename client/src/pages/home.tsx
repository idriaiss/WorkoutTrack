import { useState } from "react";
import Navigation from "@/components/navigation";
import WorkoutLogger from "@/components/workout-logger";
import Timer from "@/components/timer";
import Statistics from "@/components/statistics";
import History from "@/components/history";
import { Dumbbell, Download, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

type Tab = "workout" | "timer" | "stats" | "history";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("workout");

  const handleExportCSV = async () => {
    try {
      const response = await fetch("/api/export/csv");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "workout-data.csv";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Failed to export CSV:", error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "workout":
        return <WorkoutLogger />;
      case "timer":
        return <Timer />;
      case "stats":
        return <Statistics />;
      case "history":
        return <History />;
      default:
        return <WorkoutLogger />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Dumbbell className="text-white w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold text-foreground">WorkoutTracker Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportCSV}
                data-testid="button-export-csv"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                data-testid="button-settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </main>
    </div>
  );
}
