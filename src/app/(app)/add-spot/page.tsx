'use client';

import { useState } from 'react';
import { Plus, ListChecks } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import AddSpotWizard from '@/components/add-spot/AddSpotWizard';
import MySubmissions from '@/components/add-spot/MySubmissions';

export default function AddSpotPage() {
  const [activeTab, setActiveTab] = useState<string>('add');

  return (
    <div className="space-y-6 animate-stagger-fade-in">
      {/* Header */}
      <div className="animate-fade-in-up stagger-1">
        <h1 className="text-2xl font-bold font-display">Add a spot</h1>
        <p className="mt-1 text-muted">Share a skate spot in Lagos. Your submission will be reviewed before going live.</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-fade-in-up stagger-2">
        <TabsList className="grid w-full grid-cols-2 stagger-1 animate-fade-in-up">
          <TabsTrigger value="add" className="gap-2 press-scale transition-all duration-fast hover:bg-surface-elevated">
            <Plus className="h-4 w-4 transition-transform duration-fast hover:scale-110" />
            Add Spot
          </TabsTrigger>
          <TabsTrigger value="submissions" className="gap-2 press-scale transition-all duration-fast hover:bg-surface-elevated">
            <ListChecks className="h-4 w-4 transition-transform duration-fast hover:scale-110" />
            My Submissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="mt-6 animate-fade-in-up stagger-3">
          <AddSpotWizard />
        </TabsContent>

        <TabsContent value="submissions" className="mt-6 animate-fade-in-up stagger-3">
          <MySubmissions />
        </TabsContent>
      </Tabs>
    </div>
  );
}