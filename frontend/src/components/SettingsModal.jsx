import { Button, Modal, useOverlayState, Tabs } from "@heroui/react";
import { Palette, ImageIcon, Volume2, Settings } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { ThemeTab } from "./settings/ThemeTab";
import { BackdropTab } from "./settings/BackdropTab";
import { SoundsTab } from "./settings/SoundsTab";

export function SettingsModal() {
  const modal = useOverlayState();
  const authUser = useAuthStore((state) => state.authUser);
  const [activeTab, setActiveTab] = useState("theme");

  return (
    <Modal.Root state={modal}>
      <Modal.Trigger>
        <Button variant="ghost" size="sm" isIconOnly className="text-foreground shrink-0" aria-label="Settings">
          <Settings className="size-5" />
        </Button>
      </Modal.Trigger>

      <Modal.Backdrop variant="opaque">
        <Modal.Container size="lg" scroll="inside" placement="center">
          <Modal.Dialog className="max-h-[85dvh] border border-white/10 bg-[#2a2a2c] text-foreground shadow-2xl">
            <Modal.Header className="flex flex-row items-center justify-between gap-3 border-b border-white/10 pb-3">
              <Modal.Heading className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
                <Settings className="size-5 text-accent" />
                Settings
              </Modal.Heading>
              <Modal.CloseTrigger />
            </Modal.Header>

            <Modal.Body className="isolate space-y-6 pt-4">
              <Tabs
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(String(key))}
                variant="secondary"
                className="w-full"
              >
                <Tabs.List className="w-full bg-white/5 rounded-xl gap-0.5 p-1">
                  <Tabs.Tab id="theme" className="flex-1 justify-center gap-1.5 py-2">
                    <Palette className="size-4" />
                    Theme
                  </Tabs.Tab>
                  <Tabs.Tab id="backdrop" className="flex-1 justify-center gap-1.5 py-2">
                    <ImageIcon className="size-4" />
                    Backdrop
                  </Tabs.Tab>
                  {authUser && (
                    <Tabs.Tab id="sounds" className="flex-1 justify-center gap-1.5 py-2">
                      <Volume2 className="size-4" />
                      Sounds
                    </Tabs.Tab>
                  )}
                </Tabs.List>

                {/* 1. Theme Configuration Panel */}
                <Tabs.Panel id="theme" className="mt-4 outline-none">
                  <ThemeTab />
                </Tabs.Panel>

                {/* 2. Backdrop Wallpapers Panel */}
                <Tabs.Panel id="backdrop" className="mt-4 outline-none">
                  <BackdropTab />
                </Tabs.Panel>

                {/* 3. Sounds Settings Panel */}
                {authUser && (
                  <Tabs.Panel id="sounds" className="mt-4 outline-none">
                    <SoundsTab />
                  </Tabs.Panel>
                )}
              </Tabs>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal.Root>
  );
}
