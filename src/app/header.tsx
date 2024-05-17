/**
 * This file contains the Header component.
 */

"use server";

import ErrorBlock from "@/components/ui/errorBlock";
import Navigation from "./(components)/navigation";
import { getCurrentUserFromSession } from "@/lib/currentUser";

/**
 * Renders the Header component.
 * @returns The rendered Header component.
 */
export default async function Header() {
  try {
    const user = await getCurrentUserFromSession();

    return (
      <header className="flex align-middle justify-end p-0">
        <Navigation user={user} />
      </header>
    );
  } catch (error: any) {
    return <ErrorBlock error={error.message} text={""} />;
  }
}
