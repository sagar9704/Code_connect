import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code, Calendar, Clock, MoreVertical } from "lucide-react";
import { format } from "date-fns";

interface ProjectCardProps {
  name: string;
  description: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectCard = ({ name, description, language, createdAt, updatedAt }: ProjectCardProps) => {
  return (
    <Card className="group hover:border-primary transition-all duration-300 glow-effect bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
              <Code className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">{name}</h3>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {description}
        </p>
        <Badge variant="secondary" className="font-mono text-xs">
          {language}
        </Badge>
      </CardContent>
      
      <CardFooter className="flex justify-between text-xs text-muted-foreground border-t border-border pt-3">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{format(createdAt, 'MMM dd, yyyy')}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{format(updatedAt, 'HH:mm')}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
