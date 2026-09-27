import { History, Info, Pencil, Tag, Trash } from "lucide-react";
import { Button } from "../../ui/Button";
import { JSX, ReactNode } from "react";

type ActionVariant = "info" | "edit" | "delete" | "price" | "history";

interface ActionButtonProps {
  variant: ActionVariant;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  children: ReactNode;
}

const variantConfig: Record<
  ActionVariant,
  { className: string; icon: JSX.Element }
> = {
  info: {
    className: "bg-blue-500 hover:bg-blue-600 text-white",
    icon: <Info size={16} />,
  },
  edit: {
    className: "bg-green-500 hover:bg-green-600 text-white",
    icon: <Pencil size={16} />,
  },
  delete: {
    className: "bg-red-500 hover:bg-red-600 text-white",
    icon: <Trash size={16} />,
  },
  price: {
    className: "bg-amber-500 hover:bg-amber-600 text-white",
    icon: <Tag size={16} />,
  },
  history: {
    className: "bg-purple-500 hover:bg-purple-600 text-white",
    icon: <History size={16} />,
  },
};

export function ActionButton({
  variant,
  onClick,
  disabled = false,
  title,
  children,
}: ActionButtonProps) {
  const { className, icon } = variantConfig[variant];

  return (
    <Button
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        ${className}
        ${disabled ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed" : ""}
        w-8 h-8
      `}
    >
      {children}
    </Button>
  );
}
