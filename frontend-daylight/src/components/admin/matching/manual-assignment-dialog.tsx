'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserPlus, Users, FolderPlus } from 'lucide-react';
import { AssignUserTab } from './assign-user-tab';
import { ManageGroupsTab } from './manage-groups-tab';
import { CreateGroupTab } from './create-group-tab';
import { MatchingGroup } from '@/types/matching.types';

interface ManualAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  groups: MatchingGroup[];
}

export function ManualAssignmentDialog({
  open,
  onOpenChange,
  eventId,
  groups,
}: ManualAssignmentDialogProps) {
  const [activeTab, setActiveTab] = useState('assign');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
              <UserPlus className="h-4 w-4 text-brand" />
            </div>
            Manual Group Management
          </DialogTitle>
          <DialogDescription>
            Assign unmatched participants or modify existing groups
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="px-6 pt-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="assign" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Assign Users
              </TabsTrigger>
              <TabsTrigger value="manage" className="gap-2">
                <Users className="h-4 w-4" />
                Manage Groups
              </TabsTrigger>
              <TabsTrigger value="create" className="gap-2">
                <FolderPlus className="h-4 w-4" />
                Create Group
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[calc(90vh-200px)]">
            <div className="px-6 py-4">
              <TabsContent value="assign" className="mt-0">
                <AssignUserTab eventId={eventId} groups={groups} />
              </TabsContent>

              <TabsContent value="manage" className="mt-0">
                <ManageGroupsTab eventId={eventId} groups={groups} />
              </TabsContent>

              <TabsContent value="create" className="mt-0">
                <CreateGroupTab eventId={eventId} existingGroups={groups} />
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}