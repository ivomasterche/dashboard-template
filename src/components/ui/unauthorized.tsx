import Link from "next/link";
import { JSX, SVGProps } from "react";

export default function Unauthorized() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center">
      <div className="mx-auto w-full max-w-md space-y-6 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
        <div className="space-y-2 text-center">
          <TriangleAlertIcon className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="text-2xl font-bold">Unauthorized Access</h1>
          <p className="text-gray-500 dark:text-gray-400">
            You do not have permission to access this page. Please return to the
            home page and try again.
          </p>
        </div>
        <Link
          className="inline-flex w-full justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-900/90 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus:ring-gray-300"
          href="/"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}

function TriangleAlertIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
