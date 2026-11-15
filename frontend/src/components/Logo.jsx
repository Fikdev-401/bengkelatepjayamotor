export default function Logo({ light = false }) {
  return (
    <span className={`logo ${light ? 'logo--light' : ''}`}>
      <span className="logo__mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="22" height="22">
          <path
            d="M21.6 9.4a.7.7 0 0 0 0 1l1.5 1.5a.7.7 0 0 0 1 0l2.9-2.9a5.9 5.9 0 0 1-7.8 7.8L10.4 24.6a2.2 2.2 0 0 1-3.1-3.1L15 12.7a5.9 5.9 0 0 1 7.8-7.8l-2.9 2.9a.7.7 0 0 0 0 1z"
            fill="currentColor"
          />
          <circle cx="9.6" cy="22.6" r="1.6" fill="currentColor" />
        </svg>
      </span>
      <span className="logo__text">
        <strong>Atep Jaya</strong>
        <small>Motor</small>
      </span>
    </span>
  );
}
