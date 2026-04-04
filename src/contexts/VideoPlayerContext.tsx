import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { PluginListenerHandle, registerPlugin } from "@capacitor/core";
import { isAndroidNative } from "../utils/platform";

const PipPlugin = registerPlugin<{
  setVideoActive(opts: { active: boolean }): Promise<void>;
  addListener(
    event: "pipModeChanged",
    handler: (data: { active: boolean }) => void
  ): Promise<PluginListenerHandle>;
}>("Pip");

export type FloatingVideo = {
  type: "video" | "youtube";
  url: string;
  startTime: number;
};

type VideoPlayerCtx = {
  floatingVideo: FloatingVideo | null;
  isPipMode: boolean;
  setFloatingVideo: (v: FloatingVideo) => void;
  clearFloating: () => void;
};

const VideoPlayerContext = createContext<VideoPlayerCtx>({
  floatingVideo: null,
  isPipMode: false,
  setFloatingVideo: () => {},
  clearFloating: () => {},
});

export const VideoPlayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [floatingVideo, setFloatingVideoState] = useState<FloatingVideo | null>(null);
  const [isPipMode, setIsPipMode] = useState(false);

  useEffect(() => {
    if (!isAndroidNative()) return;
    let handle: PluginListenerHandle | undefined;
    PipPlugin.addListener("pipModeChanged", ({ active }) => {
      setIsPipMode(active);
    }).then((h) => {
      handle = h;
    });
    return () => {
      handle?.remove();
    };
  }, []);

  const setFloatingVideo = useCallback((v: FloatingVideo) => {
    setFloatingVideoState(v);
    if (isAndroidNative()) PipPlugin.setVideoActive({ active: true });
  }, []);

  const clearFloating = useCallback(() => {
    setFloatingVideoState(null);
    setIsPipMode(false);
    if (isAndroidNative()) PipPlugin.setVideoActive({ active: false });
  }, []);

  return (
    <VideoPlayerContext.Provider value={{ floatingVideo, isPipMode, setFloatingVideo, clearFloating }}>
      {children}
    </VideoPlayerContext.Provider>
  );
};

export function useVideoPlayer() {
  return useContext(VideoPlayerContext);
}
