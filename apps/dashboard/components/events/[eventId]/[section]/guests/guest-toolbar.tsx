import { Badge } from "@lumiere/dashboard-ui/components/badge";
import { Button } from "@lumiere/dashboard-ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@lumiere/dashboard-ui/components/dropdown-menu";
import {
  ChevronDownIcon,
  DownloadIcon,
  ListFilterIcon,
  ListIcon,
  RefreshCwIcon,
  SearchIcon,
  UsersIcon,
} from "@lumiere/dashboard-ui/components/icons";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@lumiere/dashboard-ui/components/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@lumiere/dashboard-ui/components/popover";
import { ToggleGroup, ToggleGroupItem } from "@lumiere/dashboard-ui/components/toggle-group";

import { DashboardSelect } from "../../../../ui/dashboard-fields";
import {
  countActiveAdvancedFilters,
  guestInviteFilterOptions,
  guestRsvpFilterOptions,
  guestSortDirectionOptions,
  guestSortOptions,
  unassignedInvitedBy,
  type GuestListFilters,
  type GuestListMode,
  type GuestSortKey,
} from "./guest-filters";
import type { GuestInviteDeliveryStage, GuestRsvpState } from "./guest-row-models";

export function GuestToolbar({
  filters,
  hasActiveFilters,
  invitedByValues,
  isRefreshing,
  mode,
  onClear,
  onExport,
  onModeChange,
  onRefresh,
  onUpdate,
}: {
  filters: GuestListFilters;
  hasActiveFilters: boolean;
  invitedByValues: string[];
  isRefreshing: boolean;
  mode: GuestListMode;
  onClear: () => void;
  onExport: () => void;
  onModeChange: (mode: GuestListMode) => void;
  onRefresh: () => void;
  onUpdate: (updates: Partial<GuestListFilters>) => void;
}) {
  const activeAdvancedFilters = countActiveAdvancedFilters(filters);
  const sortLabel =
    guestSortOptions.find((option) => option.value === filters.sort)?.label ?? "Sort";

  return (
    <section
      aria-label="Guest list controls"
      className="flex flex-col gap-3 lg:flex-row lg:items-center"
    >
      <InputGroup className="h-10 lg:max-w-sm">
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Search guests and groups"
          data-slot="input-group-control"
          onChange={(event) => onUpdate({ query: event.target.value })}
          placeholder="Search guests or groups"
          type="search"
          value={filters.query}
        />
      </InputGroup>

      <ToggleGroup
        aria-label="Guest list view"
        className="w-full sm:w-fit"
        onValueChange={(value) => {
          const next = value[0];

          if (next === "groups" || next === "guests") {
            onModeChange(next);
          }
        }}
        size="sm"
        spacing={0}
        value={[mode]}
        variant="outline"
      >
        <ToggleGroupItem type="button" value="groups">
          <ListIcon data-icon="inline-start" />
          Groups
        </ToggleGroupItem>
        <ToggleGroupItem type="button" value="guests">
          <UsersIcon data-icon="inline-start" />
          All guests
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
        <Popover>
          <PopoverTrigger render={<Button size="sm" type="button" variant="outline" />}>
            <ListFilterIcon data-icon="inline-start" />
            Filters
            {activeAdvancedFilters > 0 ? (
              <Badge className="ml-1.5" variant="secondary">
                {activeAdvancedFilters}
              </Badge>
            ) : null}
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72">
            <div className="grid gap-4">
              <DashboardSelect
                id="guest-invited-by-filter"
                label="Invited by"
                onValueChange={(value) => onUpdate({ invitedBy: value })}
                options={[
                  { label: "Anyone", value: "all" },
                  { label: "Not set", value: unassignedInvitedBy },
                  ...invitedByValues.map((value) => ({ label: value, value })),
                ]}
                value={filters.invitedBy}
              />
              <DashboardSelect
                id="guest-invite-filter"
                label="Invite status"
                onValueChange={(value) =>
                  onUpdate({ invite: value as GuestInviteDeliveryStage | "all" })
                }
                options={guestInviteFilterOptions}
                value={filters.invite}
              />
              <DashboardSelect
                id="guest-rsvp-filter"
                label="RSVP status"
                onValueChange={(value) => onUpdate({ rsvp: value as GuestRsvpState | "all" })}
                options={guestRsvpFilterOptions}
                value={filters.rsvp}
              />
              <Button
                disabled={!hasActiveFilters}
                onClick={onClear}
                size="sm"
                type="button"
                variant="outline"
              >
                Clear filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                aria-label={`Sort by ${sortLabel}`}
                size="sm"
                type="button"
                variant="outline"
              />
            }
          >
            {sortLabel}
            <ChevronDownIcon data-icon="inline-end" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup
              onValueChange={(value) => onUpdate({ sort: value as GuestSortKey })}
              value={filters.sort}
            >
              {guestSortOptions.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              onValueChange={(value) => onUpdate({ direction: value === "asc" ? "asc" : "desc" })}
              value={filters.direction}
            >
              {guestSortDirectionOptions.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button aria-label="Guest list options" size="sm" type="button" variant="outline" />
            }
          >
            More
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={onExport}>
                <DownloadIcon data-icon="inline-start" />
                Export guest data
              </DropdownMenuItem>
              <DropdownMenuItem disabled={isRefreshing} onClick={onRefresh}>
                <RefreshCwIcon data-icon="inline-start" />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>
  );
}
