import {
  getSectionDefinition,
  getTheme,
  isThemeId,
  normalizeStoryParagraphs,
  resolveThemeRendererSlot,
  type StoryParagraph,
  type ThemeDefinition,
  type ThemeMotionKind,
  type ThemeSectionComposition,
  type ThemeSectionDensity,
} from "@lumiere/themes";
import type {
  EventSection,
  JsonValue,
  PublicEventResponse,
  PublicGuestInviteResponse,
  RsvpResponseFields,
} from "@lumiere/types";

import type { AmbientAudioConfig } from "./ambient-audio-controls";
import { InviteImage } from "./invite-image";
import { resolveInviteMotionIntensity } from "./invite-motion-config";
import { InviteMaskedText, invitePressFeedbackProps } from "./invite-motion-primitives";
import { InviteMotionRuntime } from "./invite-motion-runtime";
import { InviteShell } from "./invite-shell";
import { InviteVisualLayer } from "./invite-visual-layer";
import { RsvpForm, type RsvpDesign, type RsvpQuestion, type RsvpQuestionType } from "./rsvp-form";

type JsonObject = Record<string, JsonValue>;
type InvitationContext = "guest" | "public";
type InviteResponse = PublicEventResponse | PublicGuestInviteResponse;
type GuestContext = PublicGuestInviteResponse["guest"];
type SectionComposition = ThemeSectionComposition;
type SectionDensity = ThemeSectionDensity;

type RenderableSection = {
  content: JsonObject;
  section: EventSection;
  settings: JsonObject;
};

export function PublicInvitation({ invite }: { invite: PublicEventResponse }) {
  const sections = getRenderableSections(invite.sections, "public");

  return <InvitationFrame context="public" invite={invite} sections={sections} />;
}

export function GuestInvitation({
  guestToken,
  invite,
}: {
  guestToken: string;
  invite: PublicGuestInviteResponse;
}) {
  const sections = getRenderableSections(invite.sections, "guest");

  return (
    <InvitationFrame
      context="guest"
      guest={invite.guest}
      guestToken={guestToken}
      invite={invite}
      sections={sections}
    />
  );
}

function InvitationFrame({
  context,
  guest,
  guestToken,
  invite,
  sections,
}: {
  context: InvitationContext;
  guest?: GuestContext;
  guestToken?: string;
  invite: InviteResponse;
  sections: RenderableSection[];
}) {
  const introduction = sections.find((item) => item.section.sectionType === "introduction");
  const bodySections = introduction
    ? sections.filter((item) => item.section.id !== introduction.section.id)
    : sections;
  const emptyTitle =
    context === "guest"
      ? "Guest details are being prepared"
      : "Invitation details are being prepared";
  const emptyBody =
    context === "guest"
      ? "This guest invite is valid. More private details will appear here as the host enables them."
      : "The host has published this event. Public sections will appear here as they are enabled.";
  const theme = resolveInviteTheme(invite.selectedThemeId ?? invite.theme?.id);
  const rsvpDesign = theme.composition.rsvpDesign;
  const visualSystem = theme.composition.visualSystem;
  const visualEffects = theme.composition.effects;
  const motionIntensity = resolveInviteMotionIntensity(visualSystem.motionProfile);
  const ambientAudio = resolveAmbientAudioConfig(invite, theme);
  const backdropImage = introduction ? readAsset(introduction.content.coverImage) : undefined;

  return (
    <InviteShell
      ambientAudio={ambientAudio}
      context={context}
      eventKey={invite.event.slug}
      mode={invite.themeMode}
      themeId={invite.selectedThemeId ?? invite.theme?.id}
    >
      <article
        className="lumiere-invitation min-h-[100dvh]"
        data-composition-map={visualSystem.compositionMap}
        data-backdrop-overlay={visualEffects.backdrop.overlay}
        data-backdrop-type={visualEffects.backdrop.type}
        data-divider-style={visualEffects.dividerStyle}
        data-frame-style={visualEffects.frameStyle}
        data-image-treatment={visualEffects.imageTreatment}
        data-invite-modernization="editorial-v1"
        data-motion-intensity={motionIntensity}
        data-motion-profile={visualSystem.motionProfile}
        data-motion-root="invite"
        data-parallax-profile={visualSystem.parallaxProfile}
        data-ornament-density={visualEffects.ornaments.density}
        data-ornament-set={visualEffects.ornaments.enabled ? visualEffects.ornaments.set : "none"}
        data-rsvp-design={rsvpDesign}
        data-texture-policy={visualEffects.texture.policy}
        data-texture-strength={visualEffects.texture.strength}
        data-theme-design-read={theme.designRead}
      >
        <InviteMotionRuntime intensity={motionIntensity} />
        <InviteVisualLayer backdropImageUrl={backdropImage?.url} effects={visualEffects} />
        <ScrollProgress />
        <PublicHero invite={invite} section={introduction} theme={theme} />

        {guest ? <GuestContextPanel guest={guest} /> : null}

        {bodySections.length > 0 ? (
          <div className="grid w-full gap-0 py-2 sm:py-4">
            {bodySections.map((item, index) => (
              <PublicSection
                eventSlug={invite.event.slug}
                guest={guest}
                guestToken={guestToken}
                index={index}
                key={item.section.id}
                item={item}
                rsvpDesign={rsvpDesign}
                rsvpFields={"rsvpFields" in invite ? invite.rsvpFields : undefined}
                theme={theme}
              />
            ))}
          </div>
        ) : (
          <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 lg:px-12">
            <section className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="text-xl font-semibold">{emptyTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
                {emptyBody}
              </p>
            </section>
          </div>
        )}

        <footer className="lumiere-invitation__footer px-5 pb-10 pt-3 text-sm text-[color-mix(in_srgb,var(--foreground)_64%,transparent)] sm:px-8 lg:px-12 text-center">
          <p>{invite.event.title} is hosted through Lumiere.</p>
        </footer>
      </article>
    </InviteShell>
  );
}

function ScrollProgress() {
  return (
    <div aria-hidden="true" className="lumiere-scroll-progress">
      <span className="lumiere-scroll-progress__bar" />
    </div>
  );
}

export function PublicInvitationUnavailable({
  eventSlug,
  message = "This invitation was not found, is not published, or is no longer available.",
}: {
  eventSlug: string;
  message?: string;
}) {
  return <InvitationUnavailable context="public" eventSlug={eventSlug} message={message} />;
}

export function GuestInvitationUnavailable({
  eventSlug,
  message = "This guest invite link is invalid, expired, disabled, or no longer available.",
}: {
  eventSlug: string;
  message?: string;
}) {
  return (
    <InvitationUnavailable
      context="guest"
      eventSlug={eventSlug}
      label="Guest invite unavailable"
      message={message}
      title="We could not open this guest invite."
    />
  );
}

function InvitationUnavailable({
  context,
  eventSlug,
  label = "Invitation unavailable",
  message,
  title = "We could not open this invite.",
}: {
  context: InvitationContext;
  eventSlug: string;
  label?: string;
  message: string;
  title?: string;
}) {
  return (
    <InviteShell context={context}>
      <section className="grid min-h-[100dvh] place-items-center px-5 py-10 sm:px-8">
        <div className="grid max-w-xl gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_24px_70px_color-mix(in_srgb,var(--accent)_14%,transparent)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            {label}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
            {message}
          </p>
          <p className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] px-4 py-3 text-sm">
            Requested event: <span className="font-semibold">{eventSlug}</span>
          </p>
        </div>
      </section>
    </InviteShell>
  );
}

function PublicHero({
  invite,
  section,
  theme,
}: {
  invite: InviteResponse;
  section: RenderableSection | undefined;
  theme: ThemeDefinition;
}) {
  const content = section?.content ?? {};
  const coverImage = readAsset(content.coverImage);
  const eyebrow = readString(content.eyebrow) ?? formatEventType(invite.event.eventType);
  const title = readString(content.title) ?? invite.event.title;
  const subtitle = readString(content.subtitle);
  const body = readString(content.body);
  const anchorId = section
    ? (readString(section.settings.anchorId) ?? section.section.sectionKey)
    : "introduction";
  const layout = section ? (readString(section.settings.layout) ?? "editorial") : "editorial";
  const fullViewport = theme.composition.hero.fullViewport;

  return (
    <section
      className={joinClassNames(
        "lumiere-section lumiere-section--hero lumiere-section--full-bleed grid content-center gap-8 overflow-hidden px-5 py-10 sm:px-8 lg:px-12",
        fullViewport ? "min-h-[100dvh]" : "min-h-[82dvh]",
        getHeroFrameClassName(theme),
      )}
      data-motion-kind="hero-reveal"
      data-motion-scope="invite-section"
      data-parallax-kind={resolveHeroParallaxKind(theme)}
      data-section-composition="full-bleed"
      data-section-density="spacious"
      data-section-key={section?.section.sectionKey ?? "introduction"}
      data-section-layout={layout}
      data-section-type="introduction"
      data-theme-hero-composition={theme.composition.hero.composition}
      id={anchorId}
    >
      <div className={getHeroInnerClassName(theme, Boolean(coverImage))}>
        <div className="lumiere-hero-copy grid gap-6">
          <div className="lumiere-section__kicker">
            <p className="text-sm font-semibold uppercase [letter-spacing:var(--eyebrow-tracking)] text-[var(--accent-strong)]">
              {eyebrow}
            </p>
            <span aria-hidden="true" className="lumiere-section__index">
              01
            </span>
          </div>
          <div className="grid gap-4">
            <h1 className="lumiere-display lumiere-hero-title max-w-3xl text-5xl font-semibold leading-[0.96] text-balance sm:text-7xl">
              <InviteMaskedText>{title}</InviteMaskedText>
            </h1>
            {subtitle ? (
              <p className="lumiere-hero-subtitle max-w-2xl text-xl leading-8 text-[color-mix(in_srgb,var(--foreground)_76%,transparent)]">
                {subtitle}
              </p>
            ) : null}
            {body ? (
              <p className="lumiere-hero-body max-w-2xl text-base leading-7 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
                {body}
              </p>
            ) : null}
          </div>
          <dl className="lumiere-hero-facts grid gap-3 text-sm sm:grid-cols-3">
            <HeroFact
              label="When"
              value={formatEventDate(invite.event.startsAt, invite.event.timezone)}
            />
            <HeroFact label="Where" value={invite.event.venueName ?? "Venue to be announced"} />
            <HeroFact label="Event" value={formatEventType(invite.event.eventType)} />
          </dl>
        </div>

        {coverImage ? (
          <figure
            className={getHeroMediaClassName(theme)}
            data-motion-soft-image="true"
            data-parallax-layer="hero-media"
          >
            <InviteImage
              alt={coverImage.alt}
              className={getHeroImageClassName(theme)}
              data-parallax-layer="hero-image"
              decoding="async"
              src={coverImage.url}
              priority
              sizes={getHeroImageSizes(theme)}
            />
            {coverImage.caption ? (
              <figcaption className="px-4 py-3 text-sm text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
                {coverImage.caption}
              </figcaption>
            ) : null}
          </figure>
        ) : (
          <aside className={getHeroFallbackClassName(theme)} data-parallax-layer="hero-media">
            <p className="text-sm font-semibold text-[var(--accent-strong)]">Public details</p>
            <h2 className="lumiere-display text-2xl font-semibold">{invite.event.title}</h2>
            <div className="grid gap-3">
              <DetailLine
                label="Date"
                value={formatEventDate(invite.event.startsAt, invite.event.timezone)}
              />
              <DetailLine label="Venue" value={invite.event.venueName ?? "Venue to be announced"} />
              {invite.event.venueAddress ? (
                <DetailLine label="Address" value={invite.event.venueAddress} />
              ) : null}
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}

function getHeroFrameClassName(theme: ThemeDefinition) {
  switch (theme.id) {
    case "premium":
      return "lumiere-hero--premium bg-[radial-gradient(circle_at_12%_12%,color-mix(in_srgb,var(--accent)_18%,transparent),transparent_28%),linear-gradient(180deg,color-mix(in_srgb,var(--surface)_64%,var(--background)),var(--background))]";
    case "kids":
      return "lumiere-hero--kids bg-[radial-gradient(circle_at_15%_18%,color-mix(in_srgb,var(--accent)_18%,transparent),transparent_24%),linear-gradient(180deg,var(--surface),var(--background))]";
    case "noel":
      return "lumiere-hero--noel bg-[radial-gradient(circle_at_80%_12%,color-mix(in_srgb,var(--accent)_18%,transparent),transparent_30%),linear-gradient(180deg,var(--background),color-mix(in_srgb,var(--surface-muted)_54%,var(--background)))]";
    case "editorial-ivory":
      return "lumiere-hero--editorial-ivory bg-[linear-gradient(105deg,var(--background)_0%,var(--background)_52%,color-mix(in_srgb,var(--surface-muted)_58%,var(--background))_52%,var(--surface)_100%)]";
    case "garden-light":
      return "lumiere-hero--garden-light bg-[radial-gradient(circle_at_18%_14%,color-mix(in_srgb,var(--surface-muted)_82%,transparent),transparent_30%),radial-gradient(circle_at_84%_24%,color-mix(in_srgb,var(--accent)_13%,transparent),transparent_27%),var(--background)]";
    case "modern-minimal":
      return "lumiere-hero--modern-minimal bg-[linear-gradient(90deg,var(--background)_0%,var(--background)_66%,var(--surface-muted)_66%,var(--surface-muted)_100%)]";
    case "celestial-gold":
      return "lumiere-hero--celestial-gold bg-[radial-gradient(circle_at_72%_28%,color-mix(in_srgb,var(--accent)_21%,transparent),transparent_24%),radial-gradient(circle_at_18%_80%,color-mix(in_srgb,var(--surface-muted)_64%,transparent),transparent_35%),var(--background)]";
    default:
      return "bg-[linear-gradient(180deg,var(--background),color-mix(in_srgb,var(--surface-muted)_42%,var(--background)))]";
  }
}

function getHeroInnerClassName(theme: ThemeDefinition, hasImage: boolean) {
  switch (theme.id) {
    case "premium":
      return "mx-auto grid w-full max-w-6xl gap-9 lg:grid-cols-[0.9fr_1.1fr] lg:items-center";
    case "kids":
      return "mx-auto grid w-full max-w-4xl gap-7 text-center";
    case "noel":
      return "mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center";
    case "editorial-ivory":
      return "mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center";
    case "garden-light":
      return hasImage
        ? "mx-auto grid w-full max-w-5xl gap-8 text-center"
        : "mx-auto grid w-full max-w-4xl gap-8 text-center sm:grid-cols-2 sm:text-left";
    case "modern-minimal":
      return "mx-auto grid w-full max-w-7xl gap-0 lg:grid-cols-[1.2fr_0.8fr] lg:items-stretch";
    case "celestial-gold":
      return "mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-2 lg:items-center";
    default:
      return "mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center";
  }
}

function getHeroMediaClassName(theme: ThemeDefinition) {
  const base =
    "lumiere-hero-media overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_70px_color-mix(in_srgb,var(--accent)_15%,transparent)]";

  switch (theme.id) {
    case "premium":
      return joinClassNames(
        base,
        "order-first mx-auto w-full max-w-[20rem] rounded-[var(--radius-lg)] lg:order-none lg:max-w-none",
      );
    case "kids":
      return joinClassNames(base, "mx-auto w-full max-w-[22rem] rounded-[var(--radius-lg)]");
    case "noel":
      return joinClassNames(base, "order-first rounded-[var(--radius-lg)] lg:order-none");
    case "editorial-ivory":
      return joinClassNames(
        base,
        "order-first mx-auto w-full max-w-[24rem] rounded-[var(--radius-lg)] lg:order-none lg:max-w-none",
      );
    case "garden-light":
      return joinClassNames(base, "mx-auto w-full max-w-3xl rounded-[var(--radius-lg)]");
    case "modern-minimal":
      return joinClassNames(base, "rounded-[var(--radius-lg)]");
    case "celestial-gold":
      return joinClassNames(
        base,
        "order-first mx-auto w-full max-w-[26rem] rounded-[var(--radius-lg)] lg:order-none lg:max-w-none",
      );
    default:
      return joinClassNames(base, "rounded-[var(--radius-lg)]");
  }
}

function getHeroImageClassName(theme: ThemeDefinition) {
  switch (theme.id) {
    case "kids":
      return "aspect-[4/3] w-full object-cover sm:aspect-[1/1]";
    case "noel":
      return "aspect-[4/5] w-full object-cover sm:aspect-[16/12]";
    case "garden-light":
      return "aspect-[4/3] w-full object-cover sm:aspect-[16/9]";
    case "modern-minimal":
      return "aspect-[3/4] w-full object-cover sm:aspect-[4/5] lg:h-full lg:min-h-[66dvh]";
    case "celestial-gold":
    case "editorial-ivory":
      return "aspect-[4/5] w-full object-cover lg:min-h-[68dvh]";
    default:
      return "aspect-[4/5] w-full object-cover";
  }
}

function getHeroFallbackClassName(theme: ThemeDefinition) {
  return joinClassNames(
    "grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_24px_70px_color-mix(in_srgb,var(--accent)_12%,transparent)]",
    ["premium", "editorial-ivory", "garden-light", "modern-minimal", "celestial-gold"].includes(
      theme.id,
    )
      ? "lumiere-hero-media lumiere-hero-fallback"
      : undefined,
  );
}

function GuestContextPanel({ guest }: { guest: GuestContext }) {
  return (
    <section className="lumiere-guest-panel mx-auto w-full max-w-5xl px-5 pb-4 sm:px-8 lg:px-12">
      <div className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_18px_60px_color-mix(in_srgb,var(--accent)_10%,transparent)] sm:grid-cols-[1.3fr_0.7fr] sm:items-center sm:p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
            Guest invitation
          </p>
          <h2 className="lumiere-display mt-2 text-2xl font-semibold tracking-tight">
            {guest.guestGroup.label}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
            This private link is prepared for your guest group. Please do not forward it outside
            your party.
          </p>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          <GuestFact label="Group size" value={`Max ${guest.guestGroup.maxPax} pax`} />
          <GuestFact label="RSVP" value={formatResponseStatus(guest.responseStatus)} />
        </dl>
      </div>
    </section>
  );
}

function PublicSection({
  eventSlug,
  guest,
  guestToken,
  index,
  item,
  rsvpDesign,
  rsvpFields,
  theme,
}: {
  eventSlug: string;
  guest?: GuestContext;
  guestToken?: string;
  index: number;
  item: RenderableSection;
  rsvpDesign: RsvpDesign;
  rsvpFields?: RsvpResponseFields;
  theme: ThemeDefinition;
}) {
  const definition = getSectionDefinition(item.section.sectionType);
  const anchorId = readString(item.settings.anchorId) ?? item.section.sectionKey;
  const composition = resolveSectionComposition(item, theme);
  const density = resolveSectionDensity(item, theme);
  const layout = resolveSectionLayout(item, theme);
  const motionKind = resolveMotionKind(item, composition, theme);
  const parallaxKind = resolveSectionParallaxKind(item, composition, theme);
  const rendererSlot = resolveThemeRendererSlot(theme, item.section.sectionType);
  const titleId = `${anchorId}-title`;

  return (
    <section
      aria-labelledby={titleId}
      className={getSectionFrameClassName(composition, density)}
      data-motion-kind={motionKind}
      data-motion-order={index}
      data-motion-profile={theme.composition.visualSystem.motionProfile}
      data-motion-scope="invite-section"
      data-parallax-kind={parallaxKind}
      data-section-composition={composition}
      data-section-density={density}
      data-section-key={item.section.sectionKey}
      data-section-layout={layout}
      data-section-manager-configurable={String(rendererSlot.supportsManagerConfiguration)}
      data-section-renderer={definition.rendererKey}
      data-section-renderer-coverage={rendererSlot.coverage}
      data-section-type={item.section.sectionType}
      data-section-variant={readString(item.settings.variant) ?? "default"}
      id={anchorId}
    >
      <div className={getSectionInnerClassName(composition, density)}>
        <div className="lumiere-section__kicker">
          <p className="lumiere-section__eyebrow text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
            {definition.label}
          </p>
          <span aria-hidden="true" className="lumiere-section__index">
            {String(index + 2).padStart(2, "0")}
          </span>
        </div>
        <div className="lumiere-section__body">
          <SectionBody
            composition={composition}
            eventSlug={eventSlug}
            guest={guest}
            guestToken={guestToken}
            item={item}
            layout={layout}
            rsvpDesign={rsvpDesign}
            rsvpFields={rsvpFields}
            titleId={titleId}
          />
        </div>
      </div>
    </section>
  );
}

function SectionBody({
  composition,
  eventSlug,
  guest,
  guestToken,
  item,
  layout,
  rsvpDesign,
  rsvpFields,
  titleId,
}: {
  composition: SectionComposition;
  eventSlug: string;
  guest?: GuestContext;
  guestToken?: string;
  item: RenderableSection;
  layout: string;
  rsvpDesign: RsvpDesign;
  rsvpFields?: RsvpResponseFields;
  titleId: string;
}) {
  const { content, section, settings } = item;

  switch (section.sectionType) {
    case "date":
      return <DateSection content={content} settings={settings} titleId={titleId} />;
    case "details":
      return <DetailsSection content={content} settings={settings} titleId={titleId} />;
    case "dress_code":
      return <DressCodeSection content={content} settings={settings} titleId={titleId} />;
    case "entourage":
      return <EntourageSection content={content} settings={settings} titleId={titleId} />;
    case "gallery":
      return <GallerySection composition={composition} content={content} titleId={titleId} />;
    case "location":
      return <LocationSection content={content} settings={settings} titleId={titleId} />;
    case "outro":
      return <OutroSection composition={composition} content={content} titleId={titleId} />;
    case "profile":
      return <ProfileSection content={content} layout={layout} titleId={titleId} />;
    case "rsvp":
      return (
        <RsvpSection
          content={content}
          eventSlug={eventSlug}
          guest={guest}
          guestToken={guestToken}
          rsvpDesign={rsvpDesign}
          rsvpFields={rsvpFields}
          settings={settings}
          titleId={titleId}
        />
      );
    case "story":
      return <StorySection composition={composition} content={content} titleId={titleId} />;
    case "custom":
      return <CustomSection content={content} titleId={titleId} />;
    default:
      return <GenericSection content={content} titleId={titleId} />;
  }
}

function DateSection({
  content,
  settings,
  titleId,
}: {
  content: JsonObject;
  settings: JsonObject;
  titleId: string;
}) {
  const title = readString(content.title) ?? "Date and time";
  const startsAt = readString(content.startsAt);
  const timezone = readString(content.timezone) ?? "UTC";
  const displayText = readString(content.displayText);
  const countdownLabel = readString(content.countdownLabel);
  const showCountdown = readBoolean(settings.showCountdown, true);

  return (
    <div className="lumiere-date-layout grid gap-4 sm:grid-cols-[0.85fr_1.15fr] sm:items-end">
      <div className="grid gap-3">
        <h2
          className="lumiere-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
          id={titleId}
        >
          {title}
        </h2>
        {showCountdown && countdownLabel ? (
          <p className="w-fit rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--accent-strong)]">
            {countdownLabel}
          </p>
        ) : null}
      </div>
      <div className="lumiere-date-panel rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_18px_60px_color-mix(in_srgb,var(--accent)_10%,transparent)]">
        <p className="text-lg leading-8">
          {displayText ?? (startsAt ? formatEventDate(startsAt, timezone) : "Date to be announced")}
        </p>
        <p className="mt-3 text-sm text-[color-mix(in_srgb,var(--foreground)_64%,transparent)]">
          Timezone: {timezone}
        </p>
      </div>
    </div>
  );
}

function DetailsSection({
  content,
  settings,
  titleId,
}: {
  content: JsonObject;
  settings: JsonObject;
  titleId: string;
}) {
  const title = readString(content.title) ?? "Details";
  const items = readRecordArray(content.items);
  const columns = readInteger(settings.columns, 2, 1, 3);

  return (
    <div className="lumiere-details-layout grid gap-4">
      <h2 className="lumiere-display text-3xl font-semibold tracking-tight" id={titleId}>
        {title}
      </h2>
      {items.length > 0 ? (
        <div className={joinClassNames("lumiere-detail-grid", getColumnGridClassName(columns))}>
          {items.map((item, index) => (
            <div
              className="lumiere-detail-item rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-4"
              key={index}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-strong)]">
                {readString(item.label) ?? "Detail"}
              </p>
              <p className="mt-2 text-base leading-7">{readString(item.value)}</p>
              {readString(item.hint) ? (
                <p className="mt-2 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
                  {readString(item.hint)}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <EmptySectionMessage message="Details will appear here once the host adds them." />
      )}
    </div>
  );
}

function LocationSection({
  content,
  settings,
  titleId,
}: {
  content: JsonObject;
  settings: JsonObject;
  titleId: string;
}) {
  const venueName = readString(content.venueName) ?? "Venue";
  const address = readString(content.address);
  const mapUrl = readString(content.mapUrl);
  const notes = readString(content.notes);
  const showMapPreview = readBoolean(settings.showMapPreview, true);

  return (
    <div className="lumiere-location-layout grid gap-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
      <div className="lumiere-location-copy grid gap-3">
        <h2 className="lumiere-display text-3xl font-semibold tracking-tight" id={titleId}>
          {venueName}
        </h2>
        {address ? <p className="text-lg leading-8">{address}</p> : null}
        {notes ? (
          <p className="text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
            {notes}
          </p>
        ) : null}
        {mapUrl ? (
          <a
            {...invitePressFeedbackProps}
            className="inline-flex min-h-11 w-fit items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--accent-contrast)] transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--surface)]"
            href={mapUrl}
          >
            Open map
          </a>
        ) : null}
      </div>
      {showMapPreview ? (
        <MapPreview address={address} mapUrl={mapUrl} venueName={venueName} />
      ) : null}
    </div>
  );
}

function StorySection({
  composition,
  content,
  titleId,
}: {
  composition: SectionComposition;
  content: JsonObject;
  titleId: string;
}) {
  const title = readString(content.title) ?? "Story";
  const paragraphs: StoryParagraph[] = normalizeStoryParagraphs(content.paragraphs);
  const image = readAsset(content.image);
  const isTimeline = composition === "timeline";

  return (
    <div
      className={joinClassNames(
        "lumiere-story-layout",
        image
          ? "grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start"
          : "mx-auto grid max-w-3xl gap-4",
      )}
    >
      <div className="lumiere-story-copy grid gap-4">
        <h2 className="lumiere-display text-3xl font-semibold tracking-tight" id={titleId}>
          {title}
        </h2>
        <div
          className={joinClassNames(
            "lumiere-story-rail",
            isTimeline ? "grid gap-4 border-l border-[var(--border)] pl-5" : "grid gap-3",
          )}
        >
          {paragraphs.map((paragraph, index) => (
            <div
              className={joinClassNames("lumiere-story-step", isTimeline ? "relative" : undefined)}
              key={index}
            >
              {isTimeline ? (
                <span
                  aria-hidden="true"
                  className="absolute -left-[1.65rem] top-2 size-2 rounded-full bg-[var(--accent)]"
                />
              ) : null}
              {paragraph.title ? (
                <h3
                  className={joinClassNames(
                    "lumiere-story-entry-title font-semibold",
                    isTimeline
                      ? "text-sm uppercase tracking-[0.12em] text-[var(--accent-strong)]"
                      : "text-lg leading-7",
                  )}
                >
                  {paragraph.title}
                </h3>
              ) : null}
              <p className="text-base leading-7 text-[color-mix(in_srgb,var(--foreground)_76%,transparent)]">
                {paragraph.body}
              </p>
            </div>
          ))}
        </div>
      </div>
      {image ? <SectionImage asset={image} feature={composition === "layered-media"} /> : null}
    </div>
  );
}

function ProfileSection({
  content,
  layout,
  titleId,
}: {
  content: JsonObject;
  layout: string;
  titleId: string;
}) {
  const title = readString(content.title) ?? "Hosts";
  const people = readRecordArray(content.people);
  const resolvedLayout = layout === "split" || layout === "stacked" ? layout : "cards";

  return (
    <div
      className={joinClassNames(
        "lumiere-profile-layout",
        resolvedLayout === "split" ? "grid gap-6 lg:grid-cols-[0.42fr_1fr]" : "grid gap-4",
      )}
    >
      <h2 className="lumiere-display text-3xl font-semibold tracking-tight" id={titleId}>
        {title}
      </h2>
      {people.length > 0 ? (
        <div
          className={joinClassNames(
            "lumiere-profile-grid",
            resolvedLayout === "stacked" ? "grid gap-3" : "grid gap-3 sm:grid-cols-2",
          )}
        >
          {people.map((person, index) => {
            const image = readAsset(person.image);

            return (
              <article
                className="lumiere-profile-card grid gap-3 rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-4"
                key={index}
              >
                {image ? <SectionImage asset={image} compact /> : null}
                <div className="lumiere-profile-copy">
                  <h3 className="text-xl font-semibold">{readString(person.name)}</h3>
                  {readString(person.role) ? (
                    <p className="mt-1 text-sm font-semibold text-[var(--accent-strong)]">
                      {readString(person.role)}
                    </p>
                  ) : null}
                  {readString(person.bio) ? (
                    <p className="mt-2 text-sm leading-6">{readString(person.bio)}</p>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptySectionMessage message="Featured people will appear here once the host adds them." />
      )}
    </div>
  );
}

function EntourageSection({
  content,
  settings,
  titleId,
}: {
  content: JsonObject;
  settings: JsonObject;
  titleId: string;
}) {
  const title = readString(content.title) ?? "Entourage";
  const groups = readRecordArray(content.groups);
  const columns = readInteger(settings.columns, 2, 1, 3);

  return (
    <div className="lumiere-gallery-layout grid gap-4">
      <h2 className="lumiere-display text-3xl font-semibold tracking-tight" id={titleId}>
        {title}
      </h2>
      {groups.length > 0 ? (
        <div className={getColumnGridClassName(columns)}>
          {groups.map((group, index) => (
            <div className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-4" key={index}>
              <p className="font-semibold text-[var(--accent-strong)]">
                {readString(group.label) ?? "Group"}
              </p>
              <p className="mt-2 text-sm leading-6">{readStringArray(group.names).join(", ")}</p>
            </div>
          ))}
        </div>
      ) : (
        <EmptySectionMessage message="Entourage details will appear here once they are added." />
      )}
    </div>
  );
}

function DressCodeSection({
  content,
  settings,
  titleId,
}: {
  content: JsonObject;
  settings: JsonObject;
  titleId: string;
}) {
  const title = readString(content.title) ?? "Dress code";
  const description = readString(content.description);
  const palette = readRecordArray(content.palette);
  const showSwatches = readBoolean(settings.showSwatches, true);

  return (
    <div className="grid gap-4">
      <h2 className="lumiere-display text-3xl font-semibold tracking-tight" id={titleId}>
        {title}
      </h2>
      {description ? <p className="text-base leading-7">{description}</p> : null}
      {palette.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {palette.map((item, index) => (
            <div
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm"
              key={index}
            >
              {showSwatches && readString(item.color) ? (
                <span
                  aria-hidden="true"
                  className="size-4 rounded-full border border-[var(--border)]"
                  style={{ backgroundColor: readString(item.color) }}
                />
              ) : null}
              {readString(item.label) ?? "Color"}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function GallerySection({
  composition,
  content,
  titleId,
}: {
  composition: SectionComposition;
  content: JsonObject;
  titleId: string;
}) {
  const title = readString(content.title) ?? "Gallery";
  const images = readRecordArray(content.images).flatMap((item) => {
    const asset = readAsset(item);
    return asset ? [asset] : [];
  });
  const [featuredImage, ...supportingImages] = images;

  return (
    <div className="grid gap-4">
      <h2 className="lumiere-display text-3xl font-semibold tracking-tight" id={titleId}>
        {title}
      </h2>
      {images.length > 0 ? (
        <div
          className={joinClassNames(
            "lumiere-gallery-grid",
            composition === "gallery-feature" && featuredImage
              ? "grid gap-3 lg:grid-cols-[1.15fr_0.85fr]"
              : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {composition === "gallery-feature" && featuredImage ? (
            <SectionImage asset={featuredImage} feature />
          ) : null}
          <div
            className={
              composition === "gallery-feature" && featuredImage
                ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-1"
                : "contents"
            }
          >
            {(composition === "gallery-feature" && featuredImage ? supportingImages : images).map(
              (image) => (
                <SectionImage asset={image} key={image.url} />
              ),
            )}
          </div>
        </div>
      ) : (
        <div className="grid aspect-[3/2] place-items-center rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-5 text-center text-sm text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
          Gallery images will appear here once the host adds them.
        </div>
      )}
    </div>
  );
}

function RsvpSection({
  content,
  eventSlug,
  guest,
  guestToken,
  rsvpDesign,
  rsvpFields,
  settings,
  titleId,
}: {
  content: JsonObject;
  eventSlug: string;
  guest?: GuestContext;
  guestToken?: string;
  rsvpDesign: RsvpDesign;
  rsvpFields?: RsvpResponseFields;
  settings: JsonObject;
  titleId: string;
}) {
  const title = readString(content.title) ?? "RSVP";
  const description =
    readString(content.description) ??
    "Review your guest details now. The RSVP form will open here when responses are enabled.";
  const questions = readRsvpQuestions(content.questions);
  const requireGuestToken = readBoolean(settings.requireGuestToken, true);
  const submitLabel = readSubmitLabel(content.submitLabel);
  const submitContext = guest && guestToken ? { guest, guestToken } : null;

  return (
    <div className="lumiere-rsvp-layout grid gap-5 lg:grid-cols-[1fr_0.85fr] lg:items-start">
      <div className="lumiere-rsvp-copy grid gap-4">
        <div className="grid gap-3">
          <h2 className="lumiere-display text-3xl font-semibold tracking-tight" id={titleId}>
            {title}
          </h2>
          <p className="text-base leading-7 text-[color-mix(in_srgb,var(--foreground)_76%,transparent)]">
            {description}
          </p>
          {!submitContext && requireGuestToken ? (
            <p className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
              RSVP details unlock from a valid guest invite link.
            </p>
          ) : null}
        </div>

        {questions.length > 0 ? (
          <div
            className={`gap-3 rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-4 ${
              submitContext ? "hidden lg:grid" : "grid"
            }`}
          >
            <p className="text-sm font-semibold text-[var(--accent-strong)]">
              RSVP questions prepared by the host
            </p>
            <ul className="grid gap-2 text-sm leading-6">
              {questions.map((question, index) => (
                <li
                  className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
                  key={readString(question.key) ?? index}
                >
                  <span className="font-medium">{readString(question.label) ?? "Question"}</span>
                  <span className="ml-2 text-[color-mix(in_srgb,var(--foreground)_62%,transparent)]">
                    {question.required === true ? "Required" : "Optional"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {submitContext && (
        <RsvpForm
          design={rsvpDesign}
          eventSlug={eventSlug}
          guestGroup={submitContext.guest.guestGroup}
          guestToken={submitContext.guestToken}
          initialResponseStatus={submitContext.guest.responseStatus}
          questions={questions}
          rsvpFields={rsvpFields}
          submitLabel={submitLabel}
        />
      )}
    </div>
  );
}

function OutroSection({
  composition,
  content,
  titleId,
}: {
  composition: SectionComposition;
  content: JsonObject;
  titleId: string;
}) {
  const title = readString(content.title) ?? "See you there";
  const message = readString(content.message);
  const image = readAsset(content.image);

  return (
    <div
      className={joinClassNames(
        "lumiere-outro-layout",
        image && composition === "layered-media"
          ? "grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"
          : "mx-auto grid max-w-3xl gap-4 text-center",
      )}
    >
      <div className="grid gap-4">
        <h2 className="lumiere-display text-3xl font-semibold tracking-tight" id={titleId}>
          {title}
        </h2>
        {message ? <p className="text-base leading-7">{message}</p> : null}
      </div>
      {image ? <SectionImage asset={image} feature={composition === "layered-media"} /> : null}
    </div>
  );
}

function CustomSection({ content, titleId }: { content: JsonObject; titleId: string }) {
  const title = readString(content.title) ?? "Note";
  const blocks = readRecordArray(content.blocks);

  return (
    <div className="grid gap-4">
      <h2 className="lumiere-display text-3xl font-semibold tracking-tight" id={titleId}>
        {title}
      </h2>
      {blocks.length > 0 ? (
        blocks.map((block, index) => (
          <div className="grid gap-2" key={index}>
            {readString(block.heading) ? (
              <h3 className="text-xl font-semibold">{readString(block.heading)}</h3>
            ) : null}
            <p className="text-base leading-7">{readString(block.body)}</p>
          </div>
        ))
      ) : (
        <EmptySectionMessage message="This note will appear once the host adds copy." />
      )}
    </div>
  );
}

function GenericSection({ content, titleId }: { content: JsonObject; titleId: string }) {
  return (
    <div className="grid gap-3">
      <h2 className="lumiere-display text-3xl font-semibold tracking-tight" id={titleId}>
        {readString(content.title) ?? "Event detail"}
      </h2>
      {readString(content.body) ? (
        <p className="text-base leading-7">{readString(content.body)}</p>
      ) : null}
    </div>
  );
}

function HeroFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="lumiere-hero-fact rounded-[var(--radius-md)] bg-[var(--surface)] p-4 shadow-sm">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-strong)]">
        {label}
      </dt>
      <dd className="mt-2 leading-6">{value}</dd>
    </div>
  );
}

function GuestFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--surface)] p-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-strong)]">
        {label}
      </dt>
      <dd className="mt-2 text-sm leading-6">{value}</dd>
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-strong)]">
        {label}
      </p>
      <p className="mt-2 leading-6">{value}</p>
    </div>
  );
}

function EmptySectionMessage({ message }: { message: string }) {
  return (
    <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
      {message}
    </p>
  );
}

function MapPreview({
  address,
  mapUrl,
  venueName,
}: {
  address: string | undefined;
  mapUrl: string | undefined;
  venueName: string;
}) {
  return (
    <div className="lumiere-map-preview grid aspect-[4/3] min-h-64 place-items-end overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface-muted)_88%,transparent),color-mix(in_srgb,var(--accent)_18%,var(--surface)))] p-4 shadow-[0_18px_60px_color-mix(in_srgb,var(--accent)_10%,transparent)]">
      <div className="lumiere-map-card w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-strong)]">
          Map preview
        </p>
        <p className="mt-2 font-semibold">{venueName}</p>
        {address ? (
          <p className="mt-1 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
            {address}
          </p>
        ) : (
          <p className="mt-1 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
            Address to be announced.
          </p>
        )}
        {mapUrl ? (
          <p className="mt-3 text-xs text-[color-mix(in_srgb,var(--foreground)_62%,transparent)]">
            Opens in your map app.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function SectionImage({
  asset,
  compact = false,
  feature = false,
}: {
  asset: { alt: string; caption?: string; url: string };
  compact?: boolean;
  feature?: boolean;
}) {
  const aspectClassName = feature
    ? "aspect-[4/5] sm:aspect-[16/11]"
    : compact
      ? "aspect-[4/3]"
      : "aspect-[3/2]";

  return (
    <figure
      className="lumiere-section-image overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]"
      data-image-role={feature ? "feature" : compact ? "compact" : "supporting"}
      data-motion-soft-image="true"
    >
      <InviteImage
        alt={asset.alt}
        className={`${aspectClassName} w-full object-cover`}
        data-parallax-layer="section-image"
        decoding="async"
        loading="lazy"
        src={asset.url}
        sizes={getSectionImageSizes({ compact, feature })}
      />
      {asset.caption ? (
        <figcaption className="bg-[var(--surface-muted)] px-3 py-2 text-sm">
          {asset.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function getHeroImageSizes(theme: ThemeDefinition) {
  switch (theme.id) {
    case "kids":
      return "min(22rem, 100vw)";
    case "garden-light":
      return "min(48rem, 100vw)";
    case "editorial-ivory":
      return "(min-width: 1024px) 61vw, 100vw";
    case "modern-minimal":
      return "(min-width: 1024px) 40vw, 100vw";
    case "premium":
    case "noel":
    case "celestial-gold":
      return "(min-width: 1024px) 50vw, 100vw";
    default:
      return "(min-width: 1024px) 48vw, 100vw";
  }
}

function getSectionImageSizes({ compact, feature }: { compact: boolean; feature: boolean }) {
  if (compact) {
    return "(min-width: 640px) 33vw, 100vw";
  }

  if (feature) {
    return "(min-width: 1024px) 50vw, 100vw";
  }

  return "(min-width: 768px) 50vw, 100vw";
}

function getSectionFrameClassName(composition: SectionComposition, density: SectionDensity) {
  return joinClassNames(
    "lumiere-section",
    `lumiere-section--${composition}`,
    getSectionSpacingClassName(density),
    composition === "full-bleed" || composition === "gallery-feature"
      ? "border-y border-[var(--border)] bg-[var(--surface-muted)]"
      : undefined,
    composition === "layered-media"
      ? "bg-[radial-gradient(circle_at_20%_10%,color-mix(in_srgb,var(--accent)_18%,transparent),transparent_32%),var(--background)]"
      : undefined,
    composition === "timeline" ? "bg-[var(--background)]" : undefined,
  );
}

function getSectionInnerClassName(composition: SectionComposition, density: SectionDensity) {
  const spaciousInnerPadding = density === "compact" ? "p-5 sm:p-6" : "p-5 sm:p-7 lg:p-8";

  if (composition === "framed") {
    return joinClassNames(
      "lumiere-section__inner mx-auto grid w-full max-w-5xl gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[0_16px_54px_color-mix(in_srgb,var(--accent)_8%,transparent)]",
      spaciousInnerPadding,
    );
  }

  if (composition === "timeline") {
    return "lumiere-section__inner mx-auto grid w-full max-w-5xl gap-5 px-5 sm:px-8 lg:px-12";
  }

  if (composition === "editorial-split") {
    return "lumiere-section__inner mx-auto grid w-full max-w-6xl gap-5 px-5 sm:px-8 lg:px-12";
  }

  if (composition === "gallery-feature") {
    return "lumiere-section__inner mx-auto grid w-full max-w-6xl gap-5 px-5 sm:px-8 lg:px-12";
  }

  return "lumiere-section__inner mx-auto grid w-full max-w-6xl gap-5 px-5 sm:px-8 lg:px-12";
}

function getSectionSpacingClassName(density: SectionDensity) {
  switch (density) {
    case "compact":
      return "py-8 sm:py-10";
    case "spacious":
      return "py-16 sm:py-24";
    default:
      return "py-12 sm:py-16";
  }
}

function getColumnGridClassName(columns: number) {
  switch (columns) {
    case 1:
      return "grid gap-3";
    case 3:
      return "grid gap-3 sm:grid-cols-2 lg:grid-cols-3";
    default:
      return "grid gap-3 sm:grid-cols-2";
  }
}

function resolveSectionComposition(
  item: RenderableSection,
  theme: ThemeDefinition,
): SectionComposition {
  const variantComposition = readSectionComposition(item.settings.variant);

  if (variantComposition) {
    return variantComposition;
  }

  const explicitLayout = hasOriginalSetting(item, "layout");
  const layout = explicitLayout ? readString(item.settings.layout) : undefined;

  if (!layout) {
    const themeComposition = getThemeSectionDefault(theme, item.section.sectionType)?.composition;

    if (themeComposition) {
      return themeComposition;
    }
  }

  const resolvedLayout = layout ?? readString(item.settings.layout);

  switch (item.section.sectionType) {
    case "date":
    case "rsvp":
      return "full-bleed";
    case "gallery":
      return "gallery-feature";
    case "location":
      return "editorial-split";
    case "outro":
      return resolvedLayout === "editorial" ? "layered-media" : "full-bleed";
    case "profile":
      return resolvedLayout === "split" ? "editorial-split" : "framed";
    case "story":
      if (resolvedLayout === "timeline") {
        return "timeline";
      }

      return resolvedLayout === "stacked" ? "framed" : "editorial-split";
    default:
      return "framed";
  }
}

function resolveSectionDensity(item: RenderableSection, theme: ThemeDefinition): SectionDensity {
  if (hasOriginalSetting(item, "density")) {
    return readSectionDensity(item.settings.density);
  }

  return getThemeSectionDefault(theme, item.section.sectionType)?.density ?? "balanced";
}

function resolveSectionLayout(item: RenderableSection, theme: ThemeDefinition) {
  if (hasOriginalSetting(item, "layout")) {
    return readString(item.settings.layout) ?? "default";
  }

  return (
    getThemeSectionDefault(theme, item.section.sectionType)?.layout ??
    readString(item.settings.layout) ??
    readString(item.settings.variant) ??
    "default"
  );
}

function getThemeSectionDefault(theme: ThemeDefinition, sectionType: EventSection["sectionType"]) {
  return theme.composition.sectionDefaults[sectionType];
}

function hasOriginalSetting(item: RenderableSection, key: string) {
  return Object.prototype.hasOwnProperty.call(item.section.settings, key);
}

function readSectionComposition(value: JsonValue | undefined): SectionComposition | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();

  switch (normalized) {
    case "editorial-split":
    case "framed":
    case "full-bleed":
    case "gallery-feature":
    case "layered-media":
    case "timeline":
      return normalized;
    default:
      return undefined;
  }
}

function readSectionDensity(value: JsonValue | undefined): SectionDensity {
  return value === "compact" || value === "spacious" ? value : "balanced";
}

function resolveMotionKind(
  item: RenderableSection,
  composition: SectionComposition,
  theme: ThemeDefinition,
): ThemeMotionKind {
  if (!hasOriginalSetting(item, "variant")) {
    const themeMotion = getThemeSectionDefault(theme, item.section.sectionType)?.motion;

    if (themeMotion) {
      return refineMotionKind(themeMotion, item, composition, theme);
    }
  }

  if (composition === "gallery-feature" || composition === "layered-media") {
    return "media-reveal";
  }

  if (composition === "timeline") {
    return "timeline-reveal";
  }

  if (item.section.sectionType === "date" || item.section.sectionType === "rsvp") {
    return "section-reveal";
  }

  return composition === "framed" ? "card-reveal" : "section-reveal";
}

function refineMotionKind(
  motionKind: ThemeMotionKind,
  item: RenderableSection,
  composition: SectionComposition,
  theme: ThemeDefinition,
): ThemeMotionKind {
  const visualSystem = theme.composition.visualSystem;

  if (composition === "gallery-feature" && visualSystem.motionProfile !== "calm") {
    return "gallery-drift";
  }

  if (
    motionKind === "media-reveal" &&
    visualSystem.parallaxProfile === "hero-and-media" &&
    (composition === "layered-media" || item.section.sectionType === "outro")
  ) {
    return "media-parallax";
  }

  return motionKind;
}

function resolveHeroParallaxKind(theme: ThemeDefinition) {
  return theme.composition.visualSystem.parallaxProfile === "none" ? undefined : "hero-depth";
}

function resolveSectionParallaxKind(
  item: RenderableSection,
  composition: SectionComposition,
  theme: ThemeDefinition,
) {
  const parallaxProfile = theme.composition.visualSystem.parallaxProfile;

  if (parallaxProfile === "none" || parallaxProfile === "hero-only") {
    return undefined;
  }

  if (parallaxProfile === "story-depth" && item.section.sectionType === "story") {
    return "story-depth";
  }

  if (composition === "gallery-feature") {
    return "gallery-depth";
  }

  if (composition === "layered-media" || composition === "editorial-split") {
    return "media-depth";
  }

  return undefined;
}

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

function resolveInviteTheme(themeId: string | undefined) {
  return (
    (themeId && isThemeId(themeId) ? getTheme(themeId) : undefined) ?? getTheme("lumiere-default")!
  );
}

export function resolveAmbientAudioConfig(
  invite: Pick<InviteResponse, "event" | "themeConfig">,
  theme: ThemeDefinition,
): AmbientAudioConfig | undefined {
  const themeAudio = theme.composition.ambientMedia;

  if (themeAudio.audioSlot !== "optional" || themeAudio.controlStrategy !== "external-controls") {
    return undefined;
  }

  const config =
    readAmbientAudioObject(invite.themeConfig.ambientAudio) ??
    readAmbientAudioObject(invite.event.publicSettings.ambientAudio);

  if (!config || readBoolean(config.enabled, true) === false) {
    return undefined;
  }

  const src = readString(config.src) ?? readString(config.url);

  if (!src) {
    return undefined;
  }

  return {
    autoplay: readBoolean(config.autoplay, themeAudio.defaultAutoplay),
    label: readString(config.label) ?? "Music",
    lowDistraction: readBoolean(config.lowDistraction, false),
    src,
    title: readString(config.title) ?? readString(config.label) ?? "Ambient music",
  };
}

function readAmbientAudioObject(value: JsonValue | undefined) {
  return isJsonObject(value) ? value : undefined;
}

function getRenderableSections(
  sections: EventSection[],
  context: InvitationContext,
): RenderableSection[] {
  return sections
    .filter((section) => {
      const definition = getSectionDefinition(section.sectionType);

      if (!section.enabled || section.visibility === "hidden") {
        return false;
      }

      if (context === "public") {
        return (
          section.visibility === "public" &&
          section.sectionType !== "rsvp" &&
          !definition.requiresGuestContext
        );
      }

      return section.visibility === "public" || section.visibility === "guest_only";
    })
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .flatMap((section) => {
      const definition = getSectionDefinition(section.sectionType);
      const content = definition.contentSchema.safeParse(section.content);
      const settings = definition.settingsSchema.safeParse(section.settings);

      if (!content.success || !settings.success) {
        return [];
      }

      return [
        {
          content: content.data as JsonObject,
          section,
          settings: settings.data as JsonObject,
        },
      ];
    });
}

function readString(value: JsonValue | undefined) {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function readBoolean(value: JsonValue | undefined, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function readInteger(value: JsonValue | undefined, fallback: number, min: number, max: number) {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return fallback;
  }

  return Math.min(Math.max(value, min), max);
}

function readStringArray(value: JsonValue | undefined) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function readRecordArray(value: JsonValue | undefined) {
  return Array.isArray(value) ? value.filter(isJsonObject) : [];
}

function readRsvpQuestions(value: JsonValue | undefined): RsvpQuestion[] {
  return readRecordArray(value).flatMap((question) => {
    const key = readString(question.key);
    const label = readString(question.label);
    const type = readRsvpQuestionType(question.type);

    if (!key || !label || !type) {
      return [];
    }

    return [
      {
        key,
        label,
        options: readStringArray(question.options),
        required: readBoolean(question.required, false),
        type,
      },
    ];
  });
}

function readSubmitLabel(value: JsonValue | undefined) {
  const label = readString(value);

  return !label || label === "Send RSVP" ? "Confirm attendance" : label;
}

function readRsvpQuestionType(value: JsonValue | undefined): RsvpQuestionType | undefined {
  switch (value) {
    case "multi_choice":
    case "single_choice":
    case "text":
    case "textarea":
      return value;
    default:
      return undefined;
  }
}

function readAsset(value: JsonValue | undefined) {
  if (!isJsonObject(value)) {
    return undefined;
  }

  const url = readString(value.url);
  const alt = readString(value.alt);

  if (!url || !alt) {
    return undefined;
  }

  return {
    alt,
    caption: readString(value.caption),
    url,
  };
}

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatEventDate(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));
}

function formatEventType(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatGuestGroupStatus(status: GuestContext["guestGroup"]["status"] | undefined) {
  switch (status) {
    case "declined":
      return "Declined";
    case "disabled":
      return "Disabled";
    case "opened":
      return "Opened";
    case "pending":
      return "Pending";
    case "responded":
      return "Responded";
    default:
      return "Active";
  }
}

function formatResponseStatus(status: GuestContext["responseStatus"] | undefined) {
  switch (status) {
    case "attending":
      return "Attending";
    case "maybe":
      return "Maybe";
    case "not_attending":
      return "Not attending";
    default:
      return "No response yet";
  }
}
