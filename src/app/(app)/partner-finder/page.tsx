'use client';

import { useState, useEffect, useCallback } from 'react';
import { searchUsers, SearchedUser } from '@/app/actions/search-users';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { debounce } from 'lodash';

function SearchBar({ onSearch, isLoading }: { onSearch: (query: string) => void; isLoading: boolean }) {
  const [query, setQuery] = useState('');

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      onSearch(searchQuery);
    }, 500),
    [onSearch]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedSearch(newQuery);
  };

  return (
    <div className="search-container">
      <div className="search-bar">
        <input
          type="text"
          name="text"
          className="input"
          value={query}
          onChange={handleChange}
          placeholder="Search by name, skill, or interest..."
        />
        <div className="icon">
          <svg
            version="1.1"
            id="Capa_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 488.4 488.4"
            xmlSpace="preserve"
          >
            <g>
              <path d="M0,203.25c0,112.1,91.2,203.2,203.2,203.2c51.6,0,98.8-19.4,134.7-51.2l129.5,129.5c2.4,2.4,5.5,3.6,8.7,3.6 s6.3-1.2,8.7-3.6c4.8-4.8,4.8-12.5,0-17.3l-129.6-129.5c31.8-35.9,51.2-83,51.2-134.7c0-112.1-91.2-203.2-203.2-203.2 S0,91.15,0,203.25z M381.9,203.25c0,98.5-80.2,178.7-178.7,178.7s-178.7-80.2-178.7-178.7s80.2-178.7,178.7-178.7 S381.9,104.65,381.9,203.25z" />
            </g>
          </svg>
        </div>
        <div className="i"></div>
        <div className="i"></div>
        <div className="i"></div>
        <div className="i"></div>
        <span />
      </div>
    </div>
  );
}

export default function PartnerFinderPage() {
  const [results, setResults] = useState<SearchedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    
    setIsLoading(true);
    setHasSearched(true);
    try {
      const users = await searchUsers(query);
      setResults(users);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not perform search. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <Card className="bg-card/70 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl text-glow">Find Collaborators</CardTitle>
          <CardDescription>Search for students by name, skills (e.g., React, Python), or interests (e.g., AI, Design).</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />

          {isLoading && <LoadingSpinner className="mt-8" />}

          {!isLoading && hasSearched && results.length === 0 && (
             <p className="mt-8 text-muted-foreground">No users found matching your search.</p>
          )}

          {!isLoading && results.length > 0 && (
            <div className="mt-12 w-full">
              <h2 className="text-2xl font-bold font-headline mb-4 text-glow text-center">Search Results</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {results.map((user) => (
                  <Card key={user.id} className="bg-card/80 backdrop-blur-sm border-primary/20">
                    <CardHeader className="flex flex-row items-center gap-4">
                      <Avatar className="h-12 w-12">
                         <AvatarImage src={user.profilePhotoURL || `https://placehold.co/48x48.png?text=${user.firstName.substring(0,2)}`} alt={user.firstName} />
                         <AvatarFallback>{user.firstName.substring(0,2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{user.firstName} {user.lastName}</CardTitle>
                        <Button variant="link" className="p-0 h-auto text-primary">View Profile</Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-semibold mb-2 text-muted-foreground">Skills</p>
                            <div className="flex flex-wrap gap-2">
                                {(user.skills && user.skills.length > 0) ? user.skills.map(skill => (
                                    <Badge key={skill} variant="secondary">{skill}</Badge>
                                )) : <p className="text-sm text-muted-foreground/70">No skills listed.</p>}
                            </div>
                        </div>
                         <div>
                            <p className="text-sm font-semibold mb-2 text-muted-foreground">Interests</p>
                            <div className="flex flex-wrap gap-2">
                                {(user.interests && user.interests.length > 0) ? user.interests.map(interest => (
                                    <Badge key={interest} variant="secondary">{interest}</Badge>
                                )) : <p className="text-sm text-muted-foreground/70">No interests listed.</p>}
                            </div>
                        </div>
                        <Button className="w-full mt-6 button-glow">Connect</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
