import { useEffect, useRef, useId, type ReactNode } from "react";
import { X } from "lucide-react";
export default function Dialog({
  open,
  onClose,
  title,
  children,
  closeLabel = "Close",
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  closeLabel?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (open && !ref.current?.open) ref.current?.showModal();
    else if (!open && ref.current?.open) ref.current.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onClose={onClose}
      aria-labelledby={titleId}
      className={className}
    >
      <div className="dialog-heading">
        <h2 id={titleId}>{title}</h2>
        <button aria-label={closeLabel} onClick={onClose}>
          <X size={21} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
