import { Button } from "../button";
import { RiPencilLine } from "@remixicon/react";

interface EditButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export default function EditButton({ label, onClick, disabled }: EditButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="shrink-0"
    >
      <RiPencilLine />
    </Button>
  );
}
