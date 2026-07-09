import { getSectionDefinition } from "@lumiere/themes";
import type { EventSection, JsonValue, PublicEventResponse } from "@lumiere/types";

import { InviteShell } from "./invite-shell";

type JsonObject = Record<string, JsonValue>;

type RenderableSection = {
  content: JsonObject;
  section: EventSection;
  settings: JsonObject;
};

export function PublicInvitation({ invite }: { invite: PublicEventResponse }) {
  const sections = getRenderableSections(invite.sections);
  const introduction = sections.find((item) => item.section.sectionType === "introduction");
  const bodySections = introduction
    ? sections.filter((item) => item.section.id !== introduction.section.id)
    : sections;

  return (
    <InviteShell
      context="public"
      mode={invite.themeMode}
      themeId={invite.selectedThemeId ?? invite.theme?.id}
    >
      <article className="min-h-[100dvh]">
        <PublicHero invite={invite} section={introduction} />

        {bodySections.length > 0 ? (
          <div className="mx-auto grid w-full max-w-5xl gap-5 px-5 py-8 sm:px-8 lg:px-12">
            {bodySections.map((item) => (
              <PublicSection key={item.section.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 lg:px-12">
            <section className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="text-xl font-semibold">Invitation details are being prepared</h2>
              <p className="mt-2 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
                The host has published this event. Public sections will appear here as they are
                enabled.
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
  return (
    <InviteShell context="public">
      <section className="grid min-h-[100dvh] place-items-center px-5 py-10 sm:px-8">
        <div className="grid max-w-xl gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_24px_70px_color-mix(in_srgb,var(--accent)_14%,transparent)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            Invitation unavailable
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">We could not open this invite.</h1>
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
  invite: PublicEventResponse;
  section: RenderableSection | undefined;
}) {
  const content = section?.content ?? {};
  const coverImage = readAsset(content.coverImage);
  const eyebrow = readString(content.eyebrow) ?? formatEventType(invite.event.eventType);
  const title = readString(content.title) ?? invite.event.title;
  const subtitle = readString(content.subtitle);
  const body = readString(content.body);

  return (
    <section className="grid min-h-[82dvh] content-center gap-8 px-5 py-10 sm:px-8 lg:px-12">
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

function PublicSection({ item }: { item: RenderableSection }) {
  const definition = getSectionDefinition(item.section.sectionType);
  const anchorId = readString(item.settings.anchorId) ?? item.section.sectionKey;

  return (
    <section
      className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_16px_54px_color-mix(in_srgb,var(--accent)_8%,transparent)] sm:p-7"
      data-section-type={item.section.sectionType}
      id={anchorId}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
        {definition.label}
      </p>
      <SectionBody item={item} />
    </section>
  );
}

function SectionBody({ item }: { item: RenderableSection }) {
  const { content, section } = item;

  switch (section.sectionType) {
    case "date":
      return <DateSection content={content} />;
    case "details":
      return <DetailsSection content={content} />;
    case "dress_code":
      return <DressCodeSection content={content} />;
    case "entourage":
      return <EntourageSection content={content} />;
    case "gallery":
      return <GallerySection content={content} />;
    case "location":
      return <LocationSection content={content} />;
    case "outro":
      return <OutroSection content={content} />;
    case "profile":
      return <ProfileSection content={content} />;
    case "story":
      return <StorySection content={content} />;
    case "custom":
      return <CustomSection content={content} />;
    default:
      return <GenericSection content={content} />;
  }
}

function DateSection({ content }: { content: JsonObject }) {
  const title = readString(content.title) ?? "Date and time";
  const startsAt = readString(content.startsAt);
  const timezone = readString(content.timezone) ?? "UTC";
  const displayText = readString(content.displayText);

  return (
    <div className="grid gap-3">
      <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
      <p className="text-lg leading-8">
        {displayText ?? (startsAt ? formatEventDate(startsAt, timezone) : "Date to be announced")}
      </p>
      <p className="text-sm text-[color-mix(in_srgb,var(--foreground)_64%,transparent)]">
        Timezone: {timezone}
      </p>
    </div>
  );
}

function DetailsSection({ content }: { content: JsonObject }) {
  const title = readString(content.title) ?? "Details";
  const items = readRecordArray(content.items);

  return (
    <div className="grid gap-4">
      <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
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
    </div>
  );
}

function LocationSection({ content }: { content: JsonObject }) {
  const venueName = readString(content.venueName) ?? "Venue";
  const address = readString(content.address);
  const mapUrl = readString(content.mapUrl);
  const notes = readString(content.notes);

  return (
    <div className="grid gap-3">
      <h2 className="text-3xl font-semibold tracking-tight">{venueName}</h2>
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
  );
}

function StorySection({ content }: { content: JsonObject }) {
  const title = readString(content.title) ?? "Story";
  const paragraphs = readStringArray(content.paragraphs);
  const image = readAsset(content.image);

  return (
    <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
      <div className="grid gap-3">
        <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
        {paragraphs.map((paragraph, index) => (
          <p
            className="text-base leading-7 text-[color-mix(in_srgb,var(--foreground)_76%,transparent)]"
            key={index}
          >
            {paragraph}
          </p>
        ))}
      </div>
      {image ? <SectionImage asset={image} /> : null}
    </div>
  );
}

function ProfileSection({ content }: { content: JsonObject }) {
  const title = readString(content.title) ?? "Hosts";
  const people = readRecordArray(content.people);

  return (
    <div className="grid gap-4">
      <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
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
    </div>
  );
}

function EntourageSection({ content }: { content: JsonObject }) {
  const title = readString(content.title) ?? "Entourage";
  const groups = readRecordArray(content.groups);

  return (
    <div className="grid gap-4">
      <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {groups.map((group, index) => (
          <div className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-4" key={index}>
            <p className="font-semibold text-[var(--accent-strong)]">
              {readString(group.label) ?? "Group"}
            </p>
            <p className="mt-2 text-sm leading-6">{readStringArray(group.names).join(", ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DressCodeSection({ content }: { content: JsonObject }) {
  const title = readString(content.title) ?? "Dress code";
  const description = readString(content.description);
  const palette = readRecordArray(content.palette);

  return (
    <div className="grid gap-4">
      <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
      {description ? <p className="text-base leading-7">{description}</p> : null}
      {palette.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {palette.map((item, index) => (
            <div
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm"
              key={index}
            >
              {readString(item.color) ? (
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

function GallerySection({ content }: { content: JsonObject }) {
  const title = readString(content.title) ?? "Gallery";
  const images = readRecordArray(content.images).flatMap((item) => {
    const asset = readAsset(item);
    return asset ? [asset] : [];
  });

  return (
    <div className="grid gap-4">
      <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {images.map((image) => (
          <SectionImage asset={image} key={image.url} />
        ))}
      </div>
    </div>
  );
}

function OutroSection({ content }: { content: JsonObject }) {
  const title = readString(content.title) ?? "See you there";
  const message = readString(content.message);
  const image = readAsset(content.image);

  return (
    <div className="grid gap-4">
      <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
      {message ? <p className="text-base leading-7">{message}</p> : null}
      {image ? <SectionImage asset={image} /> : null}
    </div>
  );
}

function CustomSection({ content }: { content: JsonObject }) {
  const title = readString(content.title) ?? "Note";
  const blocks = readRecordArray(content.blocks);

  return (
    <div className="grid gap-4">
      <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
      {blocks.map((block, index) => (
        <div className="grid gap-2" key={index}>
          {readString(block.heading) ? (
            <h3 className="text-xl font-semibold">{readString(block.heading)}</h3>
          ) : null}
          <p className="text-base leading-7">{readString(block.body)}</p>
        </div>
      ))}
    </div>
  );
}

function GenericSection({ content }: { content: JsonObject }) {
  return (
    <div className="grid gap-3">
      <h2 className="text-3xl font-semibold tracking-tight">
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

function SectionImage({
  asset,
  compact = false,
}: {
  asset: { alt: string; caption?: string; url: string };
  compact?: boolean;
}) {
  return (
    <figure className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)]">
      <img
        alt={asset.alt}
        className={`${compact ? "aspect-[4/3]" : "aspect-[3/2]"} w-full object-cover`}
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

function getRenderableSections(sections: EventSection[]): RenderableSection[] {
  return sections
    .filter((section) => {
      const definition = getSectionDefinition(section.sectionType);

      return (
        section.enabled &&
        section.visibility === "public" &&
        section.sectionType !== "rsvp" &&
        !definition.requiresGuestContext
      );
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

function readStringArray(value: JsonValue | undefined) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function readRecordArray(value: JsonValue | undefined) {
  return Array.isArray(value) ? value.filter(isJsonObject) : [];
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
