"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useCallback, useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import type { User } from "@/services/user";
import { updateUser, UserUpdatePayload } from "@/services/user";
import { auth } from "@/lib/firebase";

// Debounce function
const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced;
};

const profileFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters.").max(50, "Full name must be at most 50 characters."),
  lastName: z.string().optional(),
  bio: z.string().max(250, "Bio must be at most 250 characters.").optional(),
  interests: z.string().optional(),
  skills: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  initialData: User;
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
  localAvatar: string | null;
  setLocalAvatar: (avatar: string | null) => void;
}

export function ProfileForm({ initialData, isEditing, onSave, onCancel, localAvatar, setLocalAvatar }: ProfileFormProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        bio: initialData.bio || "",
        interests: (initialData.interests || []).join(", "),
        skills: (initialData.skills || []).join(", "),
    },
    mode: "onChange",
  });

  const debouncedUpdate = useCallback(
    debounce(async (data: UserUpdatePayload) => {
      const currentUser = auth.currentUser;
      if (!currentUser || !isEditing) return;

      try {
        await updateUser(currentUser.uid, data);
        toast({
          title: "Profile Saved",
          description: "Your changes have been automatically saved.",
        });
      } catch (error) {
        toast({
          title: "Update Failed",
          description: "Could not save your profile. Please try again.",
          variant: "destructive",
        });
      }
    }, 1000), // Wait 1 second after user stops typing
    [isEditing, toast]
  );
  
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (type === 'change' && name) {
        const updateData: UserUpdatePayload = {};
        if(name === 'interests' || name === 'skills') {
            updateData[name] = value[name]?.split(',').map(s => s.trim()).filter(Boolean);
        } else if (name === 'firstName' || name === 'lastName' || name === 'bio') {
            updateData[name] = value[name];
        }

        if(Object.keys(updateData).length > 0) {
            debouncedUpdate(updateData);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, debouncedUpdate]);


  useEffect(() => {
    form.reset({
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        bio: initialData.bio || "",
        interests: (initialData.interests || []).join(", "),
        skills: (initialData.skills || []).join(", "),
    });
  }, [initialData, form]);
  
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        localStorage.setItem(`avatar_${initialData.id}`, base64String);
        setLocalAvatar(base64String);
        toast({
            title: "Avatar Updated",
            description: "Your new avatar has been saved locally.",
        })
      };
      reader.readAsDataURL(file);
    }
  };

  const finalAvatarSrc = localAvatar || initialData.profilePhotoURL || `https://placehold.co/96x96.png?text=${initialData.firstName?.charAt(0) ?? 'A'}`;

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
                <AvatarImage src={finalAvatarSrc} alt="User avatar" />
                <AvatarFallback>{initialData.firstName?.charAt(0)}{initialData.lastName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
            {isEditing && 
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    Change Avatar
                </Button>
            }
        </div>

        <div className="grid md:grid-cols-2 gap-8">
            <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                    <Input placeholder="Your first name" {...field} disabled={!isEditing} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                    <Input placeholder="Your last name" {...field} disabled={!isEditing} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea placeholder="Tell us a little bit about yourself" className="resize-y min-h-[100px]" {...field} disabled={!isEditing} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="interests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Interests</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., AI, Web Development, Design, Robotics" {...field} disabled={!isEditing}/>
              </FormControl>
              <FormDescription>Separate interests with a comma.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skills</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Python, React, UI/UX, Project Management" {...field} disabled={!isEditing}/>
              </FormControl>
              <FormDescription>Separate skills with a comma.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {isEditing && (
            <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="button" onClick={onSave} className="button-glow">Done Editing</Button>
            </div>
        )}
      </form>
    </Form>
  );
}
