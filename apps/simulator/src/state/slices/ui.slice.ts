/**
 * Defines UI-only state and intent actions for panel visibility, camera mode, and notifications.
 */

import type { StateCreator } from 'zustand';

import type { RootStore } from '../store';

/** Represents allowed camera interaction presets for the lab scene viewport. */
export type CameraMode = 'orbit' | 'burette-zoom' | 'flask-zoom' | 'overview';

/** Represents a queued UI notification shown to the user. */
export interface UINotification {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  durationMs: number;
  isRead: boolean;
}

/** Represents UI-only state fields with no domain simulation logic. */
export interface UISliceState {
  isBuretteReadingPanelOpen: boolean;
  isResultsPanelOpen: boolean;
  isLabNotebookOpen: boolean;
  hoveredGlasswareId: string | null;
  cameraMode: CameraMode;
  isLoadingScene: boolean;
  notificationQueue: UINotification[];
}

/** Represents all mutation intents for UI-only interaction state. */
export interface UISliceActions {
  /** Opens the burette-reading panel. */
  openBuretteReadingPanel: () => void;
  /** Closes the burette-reading panel. */
  closeBuretteReadingPanel: () => void;
  /** Opens the results panel. */
  openResultsPanel: () => void;
  /** Closes the results panel. */
  closeResultsPanel: () => void;
  /** Opens the lab notebook panel. */
  openLabNotebook: () => void;
  /** Closes the lab notebook panel. */
  closeLabNotebook: () => void;
  /** Updates currently hovered glassware identifier for UI highlighting. */
  setHoveredGlasswareId: (id: string | null) => void;
  /** Updates camera mode for interaction and framing context. */
  setCameraMode: (mode: CameraMode) => void;
  /** Updates scene-loading indicator state. */
  setLoadingScene: (isLoading: boolean) => void;
  /** Enqueues a new notification into the UI notification queue. */
  enqueueNotification: (notification: Omit<UINotification, 'id' | 'isRead'>) => string;
  /** Marks a notification as read without removing it from queue. */
  markNotificationRead: (id: string) => void;
  /** Removes a notification from the queue by id. */
  dismissNotification: (id: string) => void;
  /** Resets this slice to initial UI defaults. */
  resetUIState: () => void;
}

/** Represents the complete UI slice contract. */
export type UISlice = UISliceState & UISliceActions;

/** Default camera mode for startup interaction. */
const DEFAULT_CAMERA_MODE: CameraMode = 'orbit';

/** Creates initial state fields for UI slice defaults. */
const createInitialUISliceState = (): UISliceState => ({
  isBuretteReadingPanelOpen: false,
  isResultsPanelOpen: false,
  isLabNotebookOpen: false,
  hoveredGlasswareId: null,
  cameraMode: DEFAULT_CAMERA_MODE,
  isLoadingScene: false,
  notificationQueue: [],
});

/** Creates a UUID string for UI notification identities. */
const createUuid = (): string => {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `ui-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

/** Creates the UI slice with typed state, reducers, and reset support. */
export const createUISlice: StateCreator<
  RootStore,
  [['zustand/devtools', never], ['zustand/immer', never]],
  [],
  UISlice
> = (set) => ({
  ...createInitialUISliceState(),

  openBuretteReadingPanel: () => {
    set(
      (state) => {
        state.isBuretteReadingPanelOpen = true;
      },
      false,
      'ui/openBuretteReadingPanel',
    );
  },

  closeBuretteReadingPanel: () => {
    set(
      (state) => {
        state.isBuretteReadingPanelOpen = false;
      },
      false,
      'ui/closeBuretteReadingPanel',
    );
  },

  openResultsPanel: () => {
    set(
      (state) => {
        state.isResultsPanelOpen = true;
      },
      false,
      'ui/openResultsPanel',
    );
  },

  closeResultsPanel: () => {
    set(
      (state) => {
        state.isResultsPanelOpen = false;
      },
      false,
      'ui/closeResultsPanel',
    );
  },

  openLabNotebook: () => {
    set(
      (state) => {
        state.isLabNotebookOpen = true;
      },
      false,
      'ui/openLabNotebook',
    );
  },

  closeLabNotebook: () => {
    set(
      (state) => {
        state.isLabNotebookOpen = false;
      },
      false,
      'ui/closeLabNotebook',
    );
  },

  setHoveredGlasswareId: (id) => {
    set(
      (state) => {
        state.hoveredGlasswareId = id;
      },
      false,
      'ui/setHoveredGlasswareId',
    );
  },

  setCameraMode: (mode) => {
    set(
      (state) => {
        state.cameraMode = mode;
      },
      false,
      'ui/setCameraMode',
    );
  },

  setLoadingScene: (isLoading) => {
    set(
      (state) => {
        state.isLoadingScene = isLoading;
      },
      false,
      'ui/setLoadingScene',
    );
  },

  enqueueNotification: (notificationInput) => {
    const id = createUuid();

    set(
      (state) => {
        state.notificationQueue.push({
          id,
          ...notificationInput,
          isRead: false,
        });
      },
      false,
      'ui/enqueueNotification',
    );

    return id;
  },

  markNotificationRead: (id) => {
    set(
      (state) => {
        const notification = state.notificationQueue.find((item: UINotification) => item.id === id);
        if (!notification) {
          throw new Error(`Cannot mark notification as read: ${id} was not found.`);
        }

        notification.isRead = true;
      },
      false,
      'ui/markNotificationRead',
    );
  },

  dismissNotification: (id) => {
    set(
      (state) => {
        const index = state.notificationQueue.findIndex((item: UINotification) => item.id === id);
        if (index < 0) {
          throw new Error(`Cannot dismiss notification: ${id} was not found.`);
        }

        state.notificationQueue.splice(index, 1);
      },
      false,
      'ui/dismissNotification',
    );
  },

  resetUIState: () => {
    set(
      (state) => {
        const initial = createInitialUISliceState();
        state.isBuretteReadingPanelOpen = initial.isBuretteReadingPanelOpen;
        state.isResultsPanelOpen = initial.isResultsPanelOpen;
        state.isLabNotebookOpen = initial.isLabNotebookOpen;
        state.hoveredGlasswareId = initial.hoveredGlasswareId;
        state.cameraMode = initial.cameraMode;
        state.isLoadingScene = initial.isLoadingScene;
        state.notificationQueue = initial.notificationQueue;
      },
      false,
      'ui/resetUIState',
    );
  },
});
