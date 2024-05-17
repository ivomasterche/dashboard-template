import { CheckCircledIcon } from "@radix-ui/react-icons";

interface FormSuccessProps {
  message: string | null;
}

export function FormSuccess({ message }: FormSuccessProps) {
  if (!message) return null;
  return (
    <div className="flex items-center rounded-md text-sm gap-x-2 p-3 bg-emerald-400/15 text-green-700">
      <CheckCircledIcon />
      <span>
        <span className="font-semibold">Success: </span>
        {message}
      </span>
    </div>
  );
}
