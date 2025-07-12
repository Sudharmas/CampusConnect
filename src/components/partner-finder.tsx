"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { findPartners } from "@/app/actions/find-partners";
import type { PartnerSuggestionsOutput } from "@/ai/flows/generate-partner-suggestions";
import LoadingSpinner from "./loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

export function PartnerFinder() {
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState("");
  const [suggestions, setSuggestions] = useState<PartnerSuggestionsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile.trim()) {
      toast({
        title: "Input required",
        description: "Please describe your interests or project.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSuggestions(null);

    try {
      const result = await findPartners({ userProfile });
      setSuggestions(result);
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Failed to get partner suggestions. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="e.g., 'I am a backend developer skilled in Python and Django, looking for a frontend developer to build a social networking app for students.' or 'Interested in sustainable energy projects and looking for partners with engineering or business backgrounds.'"
          className="min-h-[120px] bg-background"
          value={userProfile}
          onChange={(e) => setUserProfile(e.target.value)}
        />
        <Button type="submit" className="button-glow w-full md:w-auto" disabled={isLoading}>
          Find Partners
        </Button>
      </form>

      {isLoading && <LoadingSpinner className="mt-8" />}
      
      {suggestions && suggestions.suggestions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold font-headline mb-4 text-glow">Suggested Partners</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {suggestions.suggestions.map((suggestion) => (
              <Card key={suggestion.userId} className="bg-card/70 backdrop-blur-sm border-primary/20">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="h-12 w-12">
                     <AvatarImage src={`https://placehold.co/48x48.png?text=${suggestion.name.substring(0,2)}`} alt={suggestion.name} />
                     <AvatarFallback>{suggestion.name.substring(0,2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{suggestion.name}</CardTitle>
                    <Button variant="link" className="p-0 h-auto text-primary">View Profile</Button>
                  </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-semibold mb-2 text-muted-foreground">Match Score</p>
                            <div className="flex items-center gap-2">
                                <Progress value={suggestion.matchScore * 100} className="w-[80%]"/>
                                <span className="font-mono text-primary">{(suggestion.matchScore * 100).toFixed(0)}%</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-semibold mb-2 text-muted-foreground">Common Interests</p>
                            <div className="flex flex-wrap gap-2">
                                {suggestion.commonInterests.map(interest => (
                                    <Badge key={interest} variant="secondary">{interest}</Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                    <Button className="w-full mt-6 button-glow">Connect</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
