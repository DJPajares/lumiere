import { getSectionDefinition } from "@lumiere/themes";
import type {
  EventSection,
  JsonValue,
  PublicEventResponse,
  PublicGuestInviteResponse,
} from "@lumiere/types";

import { InviteShell } from "./invite-shell";
import { RsvpForm, type RsvpDesign, type RsvpQuestion, type RsvpQuestionType } from "./rsvp-form";

type JsonObject = Record<string, JsonValue>;
type InvitationContext = "guest" | "public";
type InviteResponse = PublicEventResponse | PublicGuestInviteResponse;
type GuestContext = PublicGuestInviteResponse["guest"];
type SectionComposition =
  "editorial-split" | "framed" | "full-bleed" | "gallery-feature" | "layered-media" | "timeline";
type SectionDensity = "balanced" | "compact" | "spacious";

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
  const rsvpDesign = resolveRsvpDesign(invite.selectedThemeId ?? invite.theme?.id);

  return (
    <InviteShell
      context={context}
      mode={invite.themeMode}
      themeId={invite.selectedThemeId ?? invite.theme?.id}
    >
      <article className="min-h-[100dvh]">
        <PublicHero invite={invite} section={introduction} />

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

        <footer className="mx-auto max-w-5xl px-5 pb-10 pt-3 text-sm text-[color-mix(in_srgb,var(--foreground)_64%,transparent)] sm:px-8 lg:px-12">
          <p>{invite.event.title} is hosted through Lumiere.</p>
        </footer>
      </article>
    </InviteShell>
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
}: {
  invite: InviteResponse;
  section: RenderableSection | undefined;
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

  return (
    <section
      className="lumiere-section lumiere-section--hero lumiere-section--full-bleed grid min-h-[82dvh] content-center gap-8 px-5 py-10 sm:px-8 lg:px-12"
      data-motion-kind="hero-reveal"
      data-motion-scope="invite-section"
      data-section-composition="full-bleed"
      data-section-density="spacious"
      data-section-key={section?.section.sectionKey ?? "introduction"}
      data-section-layout={layout}
      data-section-type="introduction"
      id={anchorId}
    >
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="grid gap-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
            {eyebrow}
          </p>
          <div className="grid gap-4">
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.96] text-balance sm:text-7xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="max-w-2xl text-xl leading-8 text-[color-mix(in_srgb,var(--foreground)_76%,transparent)]">
                {subtitle}
              </p>
            ) : null}
            {body ? (
              <p className="max-w-2xl text-base leading-7 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
                {body}
              </p>
            ) : null}
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <HeroFact
              label="When"
              value={formatEventDate(invite.event.startsAt, invite.event.timezone)}
            />
            <HeroFact label="Where" value={invite.event.venueName ?? "Venue to be announced"} />
            <HeroFact label="Event" value={formatEventType(invite.event.eventType)} />
          </dl>
        </div>

        {coverImage ? (
          <figure className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_70px_color-mix(in_srgb,var(--accent)_15%,transparent)]">
            <img
              alt={coverImage.alt}
              className="aspect-[4/5] w-full object-cover"
              decoding="async"
              fetchPriority="high"
              src={coverImage.url}
            />
            {coverImage.caption ? (
              <figcaption className="px-4 py-3 text-sm text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
                {coverImage.caption}
              </figcaption>
            ) : null}
          </figure>
        ) : (
          <aside className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_24px_70px_color-mix(in_srgb,var(--accent)_12%,transparent)]">
            <p className="text-sm font-semibold text-[var(--accent-strong)]">Public details</p>
            <h2 className="text-2xl font-semibold">{invite.event.title}</h2>
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

function GuestContextPanel({ guest }: { guest: GuestContext }) {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 pb-4 sm:px-8 lg:px-12">
      <div className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_18px_60px_color-mix(in_srgb,var(--accent)_10%,transparent)] sm:grid-cols-[1.3fr_0.7fr] sm:items-center sm:p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
            Guest invitation
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">{guest.guestGroup.label}</h2>
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
}: {
  eventSlug: string;
  guest?: GuestContext;
  guestToken?: string;
  index: number;
  item: RenderableSection;
  rsvpDesign: RsvpDesign;
}) {
  const definition = getSectionDefinition(item.section.sectionType);
  const anchorId = readString(item.settings.anchorId) ?? item.section.sectionKey;
  const composition = resolveSectionComposition(item);
  const density = readSectionDensity(item.settings.density);
  const layout = readString(item.settings.layout) ?? readString(item.settings.variant) ?? "default";
  const titleId = `${anchorId}-title`;

  return (
    <section
      aria-labelledby={titleId}
      className={getSectionFrameClassName(composition, density)}
      data-motion-kind={resolveMotionKind(item.section.sectionType, composition)}
      data-motion-order={index}
      data-motion-scope="invite-section"
      data-section-composition={composition}
      data-section-density={density}
      data-section-key={item.section.sectionKey}
      data-section-layout={layout}
      data-section-renderer={definition.rendererKey}
      data-section-type={item.section.sectionType}
      data-section-variant={readString(item.settings.variant) ?? "default"}
      id={anchorId}
    >
      <div className={getSectionInnerClassName(composition, density)}>
        <p className="lumiere-section__eyebrow text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
          {definition.label}
        </p>
        <div className="lumiere-section__body">
          <SectionBody
            composition={composition}
            eventSlug={eventSlug}
            guest={guest}
            guestToken={guestToken}
            item={item}
            rsvpDesign={rsvpDesign}
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
  rsvpDesign,
  titleId,
}: {
  composition: SectionComposition;
  eventSlug: string;
  guest?: GuestContext;
  guestToken?: string;
  item: RenderableSection;
  rsvpDesign: RsvpDesign;
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
      return <ProfileSection content={content} settings={settings} titleId={titleId} />;
    case "rsvp":
      return (
        <RsvpSection
          content={content}
          eventSlug={eventSlug}
          guest={guest}
          guestToken={guestToken}
          rsvpDesign={rsvpDesign}
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
    <div className="grid gap-4 sm:grid-cols-[0.85fr_1.15fr] sm:items-end">
      <div className="grid gap-3">
        <h2
          className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
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
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_18px_60px_color-mix(in_srgb,var(--accent)_10%,transparent)]">
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
    <div className="grid gap-4">
      <h2 className="text-3xl font-semibold tracking-tight" id={titleId}>
        {title}
      </h2>
      {items.length > 0 ? (
        <div className={getColumnGridClassName(columns)}>
          {items.map((item, index) => (
            <div className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-4" key={index}>
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
    <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
      <div className="grid gap-3">
        <h2 className="text-3xl font-semibold tracking-tight" id={titleId}>
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
            className="inline-flex min-h-11 w-fit items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:ring-offset-[var(--surface)]"
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
  const paragraphs = readStringArray(content.paragraphs);
  const image = readAsset(content.image);
  const isTimeline = composition === "timeline";

  return (
    <div
      className={
        image
          ? "grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start"
          : "mx-auto grid max-w-3xl gap-4"
      }
    >
      <div className="grid gap-4">
        <h2 className="text-3xl font-semibold tracking-tight" id={titleId}>
          {title}
        </h2>
        <div
          className={isTimeline ? "grid gap-4 border-l border-[var(--border)] pl-5" : "grid gap-3"}
        >
          {paragraphs.map((paragraph, index) => (
            <div className={isTimeline ? "relative" : undefined} key={index}>
              {isTimeline ? (
                <span
                  aria-hidden="true"
                  className="absolute -left-[1.65rem] top-2 size-2 rounded-full bg-[var(--accent)]"
                />
              ) : null}
              <p className="text-base leading-7 text-[color-mix(in_srgb,var(--foreground)_76%,transparent)]">
                {paragraph}
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
  settings,
  titleId,
}: {
  content: JsonObject;
  settings: JsonObject;
  titleId: string;
}) {
  const title = readString(content.title) ?? "Hosts";
  const people = readRecordArray(content.people);
  const layout = readString(settings.layout) ?? "cards";

  return (
    <div className={layout === "split" ? "grid gap-6 lg:grid-cols-[0.42fr_1fr]" : "grid gap-4"}>
      <h2 className="text-3xl font-semibold tracking-tight" id={titleId}>
        {title}
      </h2>
      {people.length > 0 ? (
        <div className={layout === "stacked" ? "grid gap-3" : "grid gap-3 sm:grid-cols-2"}>
          {people.map((person, index) => {
            const image = readAsset(person.image);

            return (
              <article
                className="grid gap-3 rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-4"
                key={index}
              >
                {image ? <SectionImage asset={image} compact /> : null}
                <div>
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
    <div className="grid gap-4">
      <h2 className="text-3xl font-semibold tracking-tight" id={titleId}>
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
      <h2 className="text-3xl font-semibold tracking-tight" id={titleId}>
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
      <h2 className="text-3xl font-semibold tracking-tight" id={titleId}>
        {title}
      </h2>
      {images.length > 0 ? (
        <div
          className={
            composition === "gallery-feature" && featuredImage
              ? "grid gap-3 lg:grid-cols-[1.15fr_0.85fr]"
              : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          }
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
  settings,
  titleId,
}: {
  content: JsonObject;
  eventSlug: string;
  guest?: GuestContext;
  guestToken?: string;
  rsvpDesign: RsvpDesign;
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
    <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr] lg:items-start">
      <div className="grid gap-4">
        <div className="grid gap-3">
          <h2 className="text-3xl font-semibold tracking-tight" id={titleId}>
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
          <div className="grid gap-3 rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-4">
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

      {submitContext ? (
        <RsvpForm
          design={rsvpDesign}
          eventSlug={eventSlug}
          guestGroup={submitContext.guest.guestGroup}
          guestToken={submitContext.guestToken}
          initialResponseStatus={submitContext.guest.responseStatus}
          questions={questions}
          submitLabel={submitLabel}
        />
      ) : (
        <aside className="grid gap-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-strong)]">
              Your invitation
            </p>
            <h3 className="mt-2 text-xl font-semibold">
              {guest?.guestGroup.label ?? "Guest group"}
            </h3>
          </div>
          <dl className="grid gap-3">
            <GuestFact label="Group size" value={`Max ${guest?.guestGroup.maxPax ?? 1} pax`} />
            <GuestFact
              label="Current response"
              value={formatResponseStatus(guest?.responseStatus)}
            />
            <GuestFact
              label="Invite status"
              value={formatGuestGroupStatus(guest?.guestGroup.status)}
            />
          </dl>
          <p className="rounded-[var(--radius-md)] bg-[var(--surface)] px-4 py-3 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
            Open this event from a valid guest invite link to submit an RSVP.
          </p>
        </aside>
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
      className={
        image && composition === "layered-media"
          ? "grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"
          : "mx-auto grid max-w-3xl gap-4 text-center"
      }
    >
      <div className="grid gap-4">
        <h2 className="text-3xl font-semibold tracking-tight" id={titleId}>
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
      <h2 className="text-3xl font-semibold tracking-tight" id={titleId}>
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
      <h2 className="text-3xl font-semibold tracking-tight" id={titleId}>
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
    <div className="rounded-[var(--radius-md)] bg-[var(--surface)] p-4 shadow-sm">
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
    <div className="grid aspect-[4/3] min-h-64 place-items-end overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface-muted)_88%,transparent),color-mix(in_srgb,var(--accent)_18%,var(--surface)))] p-4 shadow-[0_18px_60px_color-mix(in_srgb,var(--accent)_10%,transparent)]">
      <div className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
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
    <figure className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]">
      <img
        alt={asset.alt}
        className={`${aspectClassName} w-full object-cover`}
        decoding="async"
        loading="lazy"
        src={asset.url}
      />
      {asset.caption ? (
        <figcaption className="bg-[var(--surface-muted)] px-3 py-2 text-sm">
          {asset.caption}
        </figcaption>
      ) : null}
    </figure>
  );
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

function resolveSectionComposition(item: RenderableSection): SectionComposition {
  const variantComposition = readSectionComposition(item.settings.variant);

  if (variantComposition) {
    return variantComposition;
  }

  const layout = readString(item.settings.layout);

  switch (item.section.sectionType) {
    case "date":
    case "rsvp":
      return "full-bleed";
    case "gallery":
      return "gallery-feature";
    case "location":
      return "editorial-split";
    case "outro":
      return layout === "editorial" ? "layered-media" : "full-bleed";
    case "profile":
      return layout === "split" ? "editorial-split" : "framed";
    case "story":
      if (layout === "timeline") {
        return "timeline";
      }

      return layout === "stacked" ? "framed" : "editorial-split";
    default:
      return "framed";
  }
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
  sectionType: EventSection["sectionType"],
  composition: SectionComposition,
) {
  if (composition === "gallery-feature" || composition === "layered-media") {
    return "media-reveal";
  }

  if (composition === "timeline") {
    return "timeline-reveal";
  }

  if (sectionType === "date" || sectionType === "rsvp") {
    return "section-reveal";
  }

  return composition === "framed" ? "card-reveal" : "section-reveal";
}

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

function resolveRsvpDesign(themeId: string | undefined): RsvpDesign {
  switch (themeId) {
    case "kids":
      return "kids";
    case "noel":
      return "noel";
    case "premium":
      return "premium";
    default:
      return "default";
  }
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
