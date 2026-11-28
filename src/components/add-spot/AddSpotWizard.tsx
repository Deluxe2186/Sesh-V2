'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { saveDraft, submitSpot, getDraft } from '@/lib/api.client';
import { SpotSubmission, SubmissionFile } from '@/types';
import { toast } from 'sonner';
import ProgressIndicator from './ProgressIndicator';
import Step1Basics from './Step1Basics';
import Step2Obstacles from './Step2Obstacles';
import Step3Proof from './Step3Proof';
import Step4Review from './Step4Review';

const STEP_COUNT = 4;

interface FormData {
  // Base fields from SpotSubmission
  id: string;
  userId: string;
  status: 'draft' | 'ready_to_send' | 'pending_review' | 'approved';
  createdAt: string;
  updatedAt: string;
  // Step 1
  name: string;
  area: string;
  howToFind: string;
  description: string;
  surface: 'Smooth' | 'Average' | 'Rough';
  shelter: 'Open' | 'Partly covered' | 'Covered';
  bestTime: string;
  securityLevel: 'Low' | 'Medium' | 'High';
  securityNote: string;
  lat: number | null;
  lng: number | null;
  approximateLocation: boolean;
  // Step 2
  obstacles: string[];
  customObstacle: string;
  // Step 3
  files: SubmissionFile[];
  totalDataMB: number;
}

const initialFormData: FormData = {
  id: '',
  userId: '',
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  // Step 1
  name: '',
  area: '',
  howToFind: '',
  description: '',
  surface: 'Smooth',
  shelter: 'Open',
  bestTime: '',
  securityLevel: 'Low',
  securityNote: '',
  lat: null,
  lng: null,
  approximateLocation: false,
  // Step 2
  obstacles: [],
  customObstacle: '',
  // Step 3
  files: [],
  totalDataMB: 0,
};

export default function AddSpotWizard() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  const loadDraft = useCallback(async (id: string) => {
    try {
      const draft = await getDraft(id);
      if (draft && draft.userId === user?.id) {
        setFormData(draft as FormData);
        setDraftId(id);
        // Determine which step to start on based on what's filled
        if (draft.files && draft.files.length > 0) {
          setCurrentStep(4);
          setCompletedSteps([1, 2, 3]);
        } else if (draft.obstacles && draft.obstacles.length > 0) {
          setCurrentStep(3);
          setCompletedSteps([1, 2]);
        } else if (draft.name) {
          setCurrentStep(2);
          setCompletedSteps([1]);
        }
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
      toast.error('Failed to load draft');
    }
  }, [user]);

  // Load draft if draft ID in URL
  useEffect(() => {
    const draftIdFromUrl = searchParams.get('draft');
    if (draftIdFromUrl && user) {
      void loadDraft(draftIdFromUrl);
    }
  }, [loadDraft, searchParams, user]);

  const updateFormData = useCallback((partial: Partial<FormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...partial,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const markStepCompleted = useCallback((step: number) => {
    setCompletedSteps((prev) => {
      if (!prev.includes(step)) {
        return [...prev, step].sort((a, b) => a - b);
      }
      return prev;
    });
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= STEP_COUNT) {
      setCurrentStep(step);
    }
  }, []);

  const handleNext = useCallback(() => {
    markStepCompleted(currentStep);
    goToStep(currentStep + 1);
  }, [currentStep, markStepCompleted, goToStep]);

  const handleBack = useCallback(() => {
    goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  const handleSaveDraft = useCallback(async () => {
    if (!user) {
      toast.error('You must be logged in to save a draft');
      return;
    }
    if (formData.lat === null || formData.lng === null) {
      toast.error('Please set a location on the map first');
      return;
    }
    setIsSavingDraft(true);
    try {
      const draftData: SpotSubmission = {
        ...formData,
        lat: formData.lat!,
        lng: formData.lng!,
        userId: user.id,
        id: draftId || `draft-${Date.now()}`,
        status: 'ready_to_send',
      };
      const saved = await saveDraft(draftData);
      setDraftId(saved.id);
      toast.success('Draft saved. Ready to send when you are.');
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setIsSavingDraft(false);
    }
  }, [user, formData, draftId]);

  const handleSubmit = useCallback(async () => {
    if (!user) {
      toast.error('You must be logged in to submit a spot');
      return;
    }
    if (formData.lat === null || formData.lng === null) {
      toast.error('Please set a location on the map first');
      return;
    }
    setIsSubmitting(true);
    try {
      const submissionData: SpotSubmission = {
        ...formData,
        lat: formData.lat!,
        lng: formData.lng!,
        userId: user.id,
        id: draftId || `submission-${Date.now()}`,
        status: 'pending_review',
      };
      await submitSpot(submissionData);
      // Step4Review will handle the success screen and redirect
    } catch (error) {
      console.error('Failed to submit spot:', error);
      toast.error('Failed to submit spot for review');
      setIsSubmitting(false);
    }
  }, [user, formData, draftId]);

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Basics
            formData={formData}
            onChange={updateFormData}
            onNext={handleNext}
            disabled={isSubmitting || isSavingDraft}
          />
        );
      case 2:
        return (
          <Step2Obstacles
            formData={{
              obstacles: formData.obstacles,
              customObstacle: formData.customObstacle,
            }}
            onChange={updateFormData}
            onBack={handleBack}
            onNext={handleNext}
            disabled={isSubmitting || isSavingDraft}
          />
        );
      case 3:
        return (
          <Step3Proof
            formData={{
              files: formData.files,
              totalDataMB: formData.totalDataMB,
            }}
            onChange={updateFormData}
            onBack={handleBack}
            onSaveDraft={handleSaveDraft}
            onNext={handleNext}
            disabled={isSubmitting || isSavingDraft}
          />
        );
      case 4:
        return (
          <Step4Review
            formData={formData as SpotSubmission}
            onBack={handleBack}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            disabled={isSubmitting || isSavingDraft}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Progress Indicator */}
      <ProgressIndicator
        currentStep={currentStep}
        completedSteps={completedSteps}
        className="mb-4"
      />

      {/* Step Content */}
      <div className="animate-fade-in">{renderStep()}</div>
    </div>
  );
}