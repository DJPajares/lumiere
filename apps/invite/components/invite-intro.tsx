export function InviteIntro({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div aria-hidden="true" className="lumiere-intro" data-invite-intro="page-load">
      <div className="lumiere-intro__content">
        <span className="lumiere-intro__rule" />
        <p className="lumiere-intro__eyebrow">{eyebrow}</p>
        <p className="lumiere-intro__title lumiere-display">{title}</p>
      </div>
    </div>
  );
}
