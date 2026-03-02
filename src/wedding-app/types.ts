// Wedding App Type Definitions

export interface Guest {
  id?: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  phone?: string;
  driveFolderId?: string;
  isOnGuestList: boolean;
}

export interface Session {
  id: string;
  guestId: number;
  guest: Guest;
  deviceType: 'kiosk_ipad' | 'mobile';
  createdAt: string;
}

export interface Upload {
  id: string;
  guestId: number;
  sessionId: string;
  event: EventSlug;
  mediaType: 'video' | 'photo';
  filename: string;
  fileSizeBytes?: number;
  durationSeconds?: number;
  driveFileId?: string;
  driveFolderId?: string;
  uploadStatus: 'pending' | 'uploading' | 'complete' | 'failed';
  retryCount: number;
  filterApplied?: string;
  promptAnswered?: string;
  createdAt: string;
  uploadedAt?: string;
}

export interface QueuedUpload {
  id: string;
  blob: Blob;
  metadata: {
    guestId: number;
    guestName: string;
    eventSlug: EventSlug;
    mediaType: 'video' | 'photo';
    filename: string;
    filterApplied?: string;
    promptAnswered?: string;
    capturedAt: string;
  };
  status: 'queued' | 'uploading' | 'failed' | 'complete';
  retryCount: number;
  lastAttempt?: string;
  driveFileId?: string;
}

export interface WeddingEvent {
  id?: number;
  slug: EventSlug;
  name: string;
  date: string;
  description?: string;
  venueName: string;
  venueAddress?: string;
  startTime?: string;
  endTime?: string;
  sortOrder: number;
}

export interface FilterConfig {
  id: string;
  name: string;
  event: EventSlug | 'all';
  thumbnail: string;
  type: 'overlay' | 'color' | 'combined';
  overlayImage?: string;
  overlayPosition?: 'frame' | 'corner' | 'bottom-bar';
  cssFilter?: string;
  textOverlay?: {
    text: string;
    position: 'top' | 'bottom';
    font: string;
    color: string;
  };
}

export interface AIJob {
  id: string;
  guestId: number;
  jobType: 'style_transfer' | 'personalized_reel';
  status: 'pending' | 'processing' | 'complete' | 'failed';
  inputUploadIds: string[];
  outputDriveFileId?: string;
  outputUrl?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export type EventSlug = 'haldi' | 'sangeet' | 'wedding_reception';

export type VideoMode = 'prompted' | 'freeform';

export interface CapturedMedia {
  blob: Blob;
  type: 'video' | 'photo';
  dataUrl?: string; // For photo preview
  duration?: number; // For video, in seconds
  filterApplied?: string;
  promptAnswered?: string;
}
