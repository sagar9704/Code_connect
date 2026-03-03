import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const DashboardSidebar = () => {
  const userName = "John Doe"; // This will come from auth later
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-mono font-bold text-primary-foreground">
            {"</>"}
          </div>
          <span className="font-bold text-lg font-mono">CodeLab</span>
        </div>
      </div>

      <div className="p-6 flex-1">
        <div className="bg-muted rounded-lg p-4 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">Developer</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-sidebar-border">
        <Button variant="outline" className="w-full justify-start gap-2">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
