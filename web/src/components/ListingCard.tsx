import type { Listing } from "@/lib/types";
import { BedDouble, DollarSign, ExternalLink, MapPin, Ruler } from "lucide-react";
import StatusButtons from "./StatusButtons";

interface ListingCardProps {
  listing: Listing;
  onStatusChanged: () => void;
}

export default function ListingCard({ listing, onStatusChanged }: ListingCardProps) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-slate-900/60">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <div className="space-y-1.5">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {listing.address || "Listing"}
          </h4>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
            <span className="inline-flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              {listing.price ? `$${listing.price.toLocaleString()}` : "N/A"}
            </span>
            <span className="inline-flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" />
              {listing.bedrooms}+ bd
            </span>
            {listing.square_feet ? (
              <span className="inline-flex items-center gap-1">
                <Ruler className="h-3.5 w-3.5" />
                {listing.square_feet.toLocaleString()} sqft
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {listing.city}
            </span>
            <span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] dark:bg-gray-800">
              {listing.source}
            </span>
          </div>
          <a
            href={listing.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-300"
          >
            View Listing
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:gap-2">
          <StatusButtons
            listingId={listing.listing_id}
            currentStatus={listing.status}
            onUpdated={onStatusChanged}
          />
        </div>
      </div>
    </article>
  );
}
