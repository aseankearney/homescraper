import { getQuoteOfTheDay } from "@/lib/quotes";
import WizardHouseIcon from "./WizardHouseIcon";

export default function Header() {
  const quote = getQuoteOfTheDay();

  return (
    <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-5 py-7 text-white shadow-xl sm:px-10 sm:py-10">
      <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

      <div className="relative z-10 flex flex-col items-center gap-3 text-center sm:gap-4">
        <WizardHouseIcon className="h-16 w-16 sm:h-20 sm:w-20" />
        <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
          There&apos;s No Place Like a New Home
        </h1>
        <p className="max-w-lg text-sm italic text-white/75 sm:text-base">
          &ldquo;{quote.text}&rdquo;
          <span className="ml-1 not-italic text-white/55">
            &mdash; {quote.movie} ({quote.year})
          </span>
        </p>
      </div>
    </header>
  );
}
