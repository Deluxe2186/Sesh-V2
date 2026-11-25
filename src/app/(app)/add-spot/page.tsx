'use client';

import { useState } from 'react';
import { Plus, ListChecks } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import AddSpotWizard from '@/components/add-spot/AddSpotWizard';
import MySubmissions from '@/components/add-spot/MySubmissions';

export default function AddSpotPage() {
  const [activeTab, setActiveTab] = useState<string>('add');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display">Add a spot</h1>
        <p className="mt-1 text-muted">
          Share a skate spot in Lagos. Your submission will be reviewed before going live.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Spot
          </TabsTrigger>
          <TabsTrigger value="submissions" className="gap-2">
            <ListChecks className="h-4 w-4" />
            My Submissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="mt-6">
          <AddSpotWizard />
        </TabsContent>

        <TabsContent value="submissions" className="mt-6">
          <MySubmissions />
        </TabsContent>
      </Tabs>
    </div>
  );
}