/** "Milli Milli" set in a compressed display serif, as on the printed menus. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`mm-wordmark ${className}`}>
      <span className="mm-wordmark__set">Milli Milli</span>
    </span>
  );
}
