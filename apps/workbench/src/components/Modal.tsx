import { useEffect, useId, useRef, type ReactNode } from "react";

export function Modal({
  open,
  title,
  children,
  footer,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  footer: ReactNode;
  onClose?: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      const heading = dialog.querySelector<HTMLElement>("[data-modal-heading]");
      heading?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={headingId}
      onCancel={(event) => {
        event.preventDefault();
        onClose?.();
      }}
      onClose={() => onClose?.()}
    >
      <div className="modal-body">
        <h2 id={headingId} data-modal-heading tabIndex={-1}>
          {title}
        </h2>
        {children}
        <div className="modal-actions">{footer}</div>
      </div>
    </dialog>
  );
}
