export function InviteIntro({ eyebrow, title }: { eyebrow: string; title: string }) {
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
          <p className="lumiere-intro__eyebrow">{eyebrow}</p>
          <p className="lumiere-intro__title lumiere-display">{title}</p>
        </div>
      </div>
    </div>
  );
}
