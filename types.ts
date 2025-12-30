
// Import React to provide the React namespace for ReactNode
import React from 'react';

export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  LIMITED = 'LIMITED',
  UNAVAILABLE = 'UNAVAILABLE',
  NO_RESPONSE = 'NO_RESPONSE'
}

export interface TeamMember {
  email: string;
  displayName: string;
  dmSpaceName: string;
  active: boolean;
  currentStatus: AvailabilityStatus;
  lastRespondedAt?: string;
  notes?: string;
  startTime?: string;
  endTime?: string;
}

export interface PollResult {
  date: string;
  pollId: string;
  email: string;
  status: AvailabilityStatus;
  respondedAt: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}