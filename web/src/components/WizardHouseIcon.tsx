interface WizardHouseIconProps {
  className?: string;
}

export default function WizardHouseIcon({
  className = "h-10 w-10",
}: WizardHouseIconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="House with ruby slippers"
    >
      <path d="M8 30L32 10L56 30V54H8V30Z" fill="#fff" fillOpacity="0.9" />
      <path d="M18 26H46V54H18V26Z" fill="#E5E7EB" />
      <path d="M28 38H36V54H28V38Z" fill="#6366F1" />
      <path d="M22 31H27V36H22V31Z" fill="#93C5FD" />
      <path d="M37 31H42V36H37V31Z" fill="#93C5FD" />
      <path
        d="M32 10L5 31"
        stroke="#F8FAFC"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M32 10L59 31"
        stroke="#F8FAFC"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M22 54V60" stroke="#111827" strokeWidth="3" />
      <path d="M42 54V60" stroke="#111827" strokeWidth="3" />
      <ellipse cx="20" cy="61" rx="5" ry="2" fill="#DC2626" />
      <ellipse cx="44" cy="61" rx="5" ry="2" fill="#DC2626" />
      <path d="M18 60L22 59L24 61L22 63L18 62V60Z" fill="#EF4444" />
      <path d="M40 60L44 59L46 61L44 63L40 62V60Z" fill="#EF4444" />
    </svg>
  );
}
