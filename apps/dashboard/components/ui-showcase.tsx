"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@lumiere/dashboard-ui/components/alert-dialog";
import { Avatar, AvatarFallback } from "@lumiere/dashboard-ui/components/avatar";
import { Badge } from "@lumiere/dashboard-ui/components/badge";
import { Button } from "@lumiere/dashboard-ui/components/button";
import { Calendar } from "@lumiere/dashboard-ui/components/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@lumiere/dashboard-ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@lumiere/dashboard-ui/components/dropdown-menu";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@lumiere/dashboard-ui/components/field";
import { Input } from "@lumiere/dashboard-ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@lumiere/dashboard-ui/components/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lumiere/dashboard-ui/components/select";
import { Skeleton } from "@lumiere/dashboard-ui/components/skeleton";
import { toast } from "@lumiere/dashboard-ui/components/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@lumiere/dashboard-ui/components/tabs";
import { Textarea } from "@lumiere/dashboard-ui/components/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@lumiere/dashboard-ui/components/tooltip";
const showcaseDate = new Date(2026, 6, 18);

export function DashboardUiShowcase() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(showcaseDate);

  return (
    <main className="min-h-[100dvh] bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-8">
        <header className="grid gap-3 border-b border-border pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Base UI</Badge>
            <Badge variant="outline">base-nova</Badge>
            <Badge variant="secondary">Dashboard only</Badge>
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Lumiere dashboard UI
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              A working surface for reviewing dashboard primitives, field states, theme contrast,
              and focus behavior before they enter event-management flows.
            </p>
          </div>
        </header>

        <section aria-labelledby="theme-states-heading" className="grid gap-4">
          <div>
            <h2 className="text-xl font-semibold" id="theme-states-heading">
              Field states
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Light and dark tokens use the same component markup and Lumiere product accent.
            </p>
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            <ThemeFieldPanel mode="light" />
            <ThemeFieldPanel mode="dark" />
          </div>
        </section>

        <section aria-labelledby="interaction-heading" className="grid gap-4">
          <div>
            <h2 className="text-xl font-semibold" id="interaction-heading">
              Interaction and feedback
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Keyboard-managed overlays and notifications use project-owned shadcn wrappers.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => toast.success("Event draft saved.")}>Save draft</Button>

              <Dialog>
                <DialogTrigger render={<Button variant="outline" />}>Review publish</DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Publish Saturday garden dinner?</DialogTitle>
                    <DialogDescription>
                      Guests with the invitation link will see the latest content and RSVP window.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter showCloseButton>
                    <Button onClick={() => toast.success("Invitation published.")}>Publish</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Popover>
                <PopoverTrigger render={<Button variant="outline" />}>
                  <span aria-hidden="true">Date:</span>
                  {selectedDate?.toLocaleDateString("en-SG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <PopoverHeader className="px-3 pt-3">
                    <PopoverTitle>Event date</PopoverTitle>
                    <PopoverDescription>Shown in the event timezone.</PopoverDescription>
                  </PopoverHeader>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    defaultMonth={showcaseDate}
                  />
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button aria-label="Open event actions" size="icon" variant="outline" />}
                >
                  <span aria-hidden="true">•••</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Event actions</DropdownMenuLabel>
                    <DropdownMenuItem>Duplicate draft</DropdownMenuItem>
                    <DropdownMenuItem>Copy invitation link</DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem variant="destructive">Archive event</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Tooltip>
                <TooltipTrigger
                  render={<Button aria-label="About publishing" size="icon" variant="ghost" />}
                >
                  <span aria-hidden="true">?</span>
                </TooltipTrigger>
                <TooltipContent>Publishing keeps the current RSVP window.</TooltipContent>
              </Tooltip>

              <AlertDialog>
                <AlertDialogTrigger render={<Button variant="destructive" />}>
                  Close RSVPs
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Close the RSVP window?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Guests will keep their existing responses but cannot submit changes.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep open</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() => toast.warning("RSVP window closed.")}
                    >
                      Close RSVPs
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Avatar aria-label="Manager account">
                <AvatarFallback>LM</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function ThemeFieldPanel({ mode }: { mode: "light" | "dark" }) {
  const fieldId = `${mode}-event-title`;
  const errorId = `${mode}-event-slug-error`;

  return (
    <article
      className={`${mode} grid content-start gap-5 rounded-xl border border-border bg-background p-5 text-foreground shadow-sm sm:p-6`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold capitalize">{mode} theme</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Default, filled, invalid, and disabled
          </p>
        </div>
        <Badge variant={mode === "dark" ? "secondary" : "outline"}>{mode}</Badge>
      </div>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={fieldId}>Event title</FieldLabel>
          <Input id={fieldId} placeholder="Saturday garden dinner" />
          <FieldDescription>Visible to guests on the invitation.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor={`${mode}-host-name`}>Host name</FieldLabel>
          <Input id={`${mode}-host-name`} defaultValue="Lumiere Events" />
        </Field>

        <Field data-invalid="true">
          <FieldLabel htmlFor={`${mode}-event-slug`}>Invitation slug</FieldLabel>
          <Input
            aria-describedby={errorId}
            aria-invalid="true"
            id={`${mode}-event-slug`}
            defaultValue="Saturday Dinner!"
          />
          <FieldError id={errorId}>Use lowercase letters, numbers, and hyphens only.</FieldError>
        </Field>

        <Field data-disabled="true">
          <FieldLabel htmlFor={`${mode}-public-id`}>Public event ID</FieldLabel>
          <Input disabled id={`${mode}-public-id`} value="evt_7K2M9" readOnly />
          <FieldDescription>Assigned when the event is created.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor={`${mode}-event-type`}>Event type</FieldLabel>
          <Select defaultValue="dinner">
            <SelectTrigger className="w-full" id={`${mode}-event-type`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="dinner">Private dinner</SelectItem>
                <SelectItem value="wedding">Wedding</SelectItem>
                <SelectItem value="launch">Launch event</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor={`${mode}-host-note`}>Host note</FieldLabel>
          <Textarea
            id={`${mode}-host-note`}
            placeholder="Add arrival or dress-code guidance for guests."
          />
        </Field>
      </FieldGroup>

      <Tabs defaultValue="ready">
        <TabsList>
          <TabsTrigger value="ready">Ready</TabsTrigger>
          <TabsTrigger value="loading">Loading</TabsTrigger>
        </TabsList>
        <TabsContent className="pt-3" value="ready">
          <div className="flex flex-wrap items-center gap-2">
            <Button>Primary action</Button>
            <Button variant="outline">Secondary</Button>
            <Button disabled>Disabled</Button>
          </div>
        </TabsContent>
        <TabsContent className="grid gap-2 pt-3" value="loading">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
        </TabsContent>
      </Tabs>
    </article>
  );
}
