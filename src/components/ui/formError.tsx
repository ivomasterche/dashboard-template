import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface FormErrorProps {
  message: string | null;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;
  return (
    <div className="flex items-center rounded-md text-sm gap-x-2 p-3 bg-destructive/15 text-red-700">
      <ExclamationTriangleIcon />
      <span>
        <span className="font-semibold">Error: </span>
        {message}
      </span>
    </div>
  );
}
