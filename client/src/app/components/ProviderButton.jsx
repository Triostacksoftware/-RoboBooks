/* ------------ Social provider button helper ------------ */
function ProviderButton({ label, children, onClick }) {
  return (
    <button
      type="button"
      aria-label={`Sign in with ${label}`}
      title={label}
      onClick={onClick}
      className={[
        "grid h-10 w-12 place-items-center rounded-2xl",
        "bg-white border border-slate-200/80 shadow-sm",
        "transition duration-200 ease-out will-change-transform",
        "hover:shadow-md hover:scale-[1.02] active:scale-95",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20",
      ].join(" ")}
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}
export default ProviderButton;