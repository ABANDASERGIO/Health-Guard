"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export function SessionTimeoutModal({
  open,
  onExtend,
  onLogout,
}: {
  open: boolean;
  onExtend: () => void;
  onLogout: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onExtend}
      title="Session timeout approaching"
      description="For your security, inactive sessions end automatically. You can extend your session or sign out now."
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" type="button" onClick={onLogout}>
          Sign out
        </Button>
        <Button type="button" onClick={onExtend}>
          Extend session
        </Button>
      </div>
    </Modal>
  );
}
