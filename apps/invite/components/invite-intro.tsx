export function InviteIntro({
  description,
  eyebrow,
  subtitle,
  title,
}: {
  description?: string;
  eyebrow?: string;
  subtitle?: string;
  title: string;
}) {
  return (
    <div aria-hidden="true" className="lumiere-intro" data-invite-intro="page-load">
      <span className="lumiere-intro__field" />
      <div className="lumiere-intro__scene">
        <span className="lumiere-intro__shape lumiere-intro__shape--1" />
        <span className="lumiere-intro__shape lumiere-intro__shape--2" />
        <span className="lumiere-intro__shape lumiere-intro__shape--3" />
        <span className="lumiere-intro__shape lumiere-intro__shape--4" />
      </div>
      <div className="lumiere-intro__center">
        <div className="lumiere-intro__content">
          <span className="lumiere-intro__rule" />
          {eyebrow ? (
            <p className="lumiere-intro__eyebrow lumiere-type-eyebrow">{eyebrow}</p>
          ) : null}
          <p className="lumiere-intro__title lumiere-type-hero">{title}</p>
          {subtitle ? (
            <p className="lumiere-intro__subtitle lumiere-type-hero-subtitle">{subtitle}</p>
          ) : null}
          {description ? (
            <p className="lumiere-intro__description lumiere-type-description">{description}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
