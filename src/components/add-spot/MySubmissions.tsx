'use client';

import { useEffect, useState } from 'react';
import { Clock, CheckCircle, FileText, Send, Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getUserSubmissions, submitSpot, deleteDraft, getDraft } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { SpotSubmission, SubmissionStatus } from '@/types';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  draft: {
    label: 'Draft',
    variant: 'outline',
    icon: <FileText className="h-3 w-3" />,
  },
  ready_to_send: {
    label: 'Ready to send',
    variant: 'secondary',
    icon: <Send className="h-3 w-3" />,
  },
  pending_review: {
    label: 'Pending review',
    variant: 'default',
    icon: <Clock className="h-3 w-3" />,
  },
  approved: {
    label: 'Approved',
    variant: 'default',
    icon: <CheckCircle className="h-3 w-3" />,
  },
};

interface MySubmissionsProps {
  className?: string;
}

export default function MySubmissions({ className }: MySubmissionsProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<SpotSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSubmissions();
    }
  }, [user]);

  const loadSubmissions = async () => {
    if (!user) return;
    try {
      const data = await getUserSubmissions(user.id);
      setSubmissions(data);
    } catch (error) {
      console.error('Failed to load submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNow = async (submission: SpotSubmission) => {
    setSubmittingId(submission.id);
    try {
      await submitSpot(submission);
      toast.success('Submitted for review');
      loadSubmissions();
    } catch (error) {
      console.error('Failed to submit:', error);
      toast.error('Failed to submit for review');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDeleteDraft = async (id: string) => {
    if (!confirm('Delete this draft?')) return;
    setDeletingId(id);
    try {
      await deleteDraft(id);
      toast.success('Draft deleted');
      loadSubmissions();
    } catch (error) {
      console.error('Failed to delete draft:', error);
      toast.error('Failed to delete draft');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditDraft = async (id: string) => {
    const draft = await getDraft(id);
    if (draft) {
      // Navigate to add-spot with draft data
      // For now, just navigate - the wizard should handle pre-filling
      router.push(`/add-spot?draft=${id}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-4 w-1/4 bg-secondary rounded" />
              <div className="mt-4 h-3 w-1/2 bg-secondary rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className={cn('rounded-[12px] border bg-surface p-8 text-center', className)}>
        <FileText className="mx-auto h-12 w-12 text-muted" />
        <h3 className="mt-4 text-lg font-semibold">No submissions yet</h3>
        <p className="mt-1 text-sm text-muted">
          Your drafts and submitted spots will appear here
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {submissions.map((submission) => {
        const config = STATUS_CONFIG[submission.status];
        const isDraft = submission.status === 'draft' || submission.status === 'ready_to_send';

        return (
          <Card key={submission.id} className="overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold font-display truncate">{submission.name}</h3>
                    <Badge variant={config.variant} className="gap-1">
                      {config.icon}
                      {config.label}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted">{submission.area}</p>
                  <p className="mt-1 text-xs text-muted">Updated {formatDate(submission.updatedAt)}</p>
                  {submission.totalDataMB && (
                    <p className="mt-1 text-xs text-muted">
                      {submission.totalDataMB.toFixed(2)} MB • {submission.files.length} file(s)
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isDraft && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditDraft(submission.id)}
                        disabled={submittingId === submission.id || deletingId === submission.id}
                        className="rounded-full"
                      >
                        {submission.status === 'ready_to_send' ? 'Send now' : 'Edit'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendNow(submission)}
                        disabled={submittingId === submission.id || deletingId === submission.id}
                        className="rounded-full bg-accent text-accent-foreground border-accent hover:bg-accent/90"
                      >
                        {submittingId === submission.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Submit'
                        )}
                      </Button>
                    </>
                  )}
                  {(submission.status === 'draft' || submission.status === 'ready_to_send') && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteDraft(submission.id)}
                      disabled={deletingId === submission.id}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}