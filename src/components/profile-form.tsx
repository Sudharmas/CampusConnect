"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";

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
import { updateUser } from "@/services/user";
import { auth } from "@/lib/firebase";

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
}

export function ProfileForm({ initialData, isEditing, onSave, onCancel }: ProfileFormProps) {
  const { toast } = useToast();
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

  useEffect(() => {
    form.reset({
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        bio: initialData.bio || "",
        interests: (initialData.interests || []).join(", "),
        skills: (initialData.skills || []).join(", "),
    });
  }, [initialData, form]);

  async function onSubmit(data: ProfileFormValues) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        toast({ title: "Error", description: "You must be logged in to update your profile.", variant: "destructive"});
        return;
    }

    try {
        const updateData = {
            firstName: data.firstName,
            lastName: data.lastName,
            bio: data.bio,
            interests: data.interests?.split(',').map(s => s.trim()).filter(Boolean) || [],
            skills: data.skills?.split(',').map(s => s.trim()).filter(Boolean) || [],
        };

        await updateUser(currentUser.uid, updateData);
        
        toast({
            title: "Profile Updated!",
            description: "Your new information has been saved.",
        });
        onSave();
    } catch (error) {
         toast({
            title: "Update Failed",
            description: "Could not save your profile. Please try again.",
            variant: "destructive",
        });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
                <AvatarImage src={initialData.profilePhotoURL || `https://placehold.co/96x96.png?text=${initialData.firstName.charAt(0)}`} alt="User avatar" />
                <AvatarFallback>{initialData.firstName.charAt(0)}{initialData.lastName?.charAt(0)}</AvatarFallback>
            </Avatar>
            {isEditing && <Button type="button" variant="outline">Change Avatar</Button>}
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
            <Button type="submit" className="button-glow">Save Changes</Button>
            </div>
        )}
      </form>
    </Form>
  );
}
