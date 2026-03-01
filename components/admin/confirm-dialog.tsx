"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Eliminar",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Dialog onClose={onClose} open={open} className="relative z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-sm overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-destructive/10 dark:bg-destructive/20">
                <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  {title}
                </DialogTitle>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {message}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-neutral-200 px-6 py-4 dark:border-neutral-700">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onConfirm();
              }}
              className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-destructive/90"
            >
              {confirmLabel}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
