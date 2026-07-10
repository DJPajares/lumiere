# Dashboard Dropdown Inventory

This inventory records the manager controls reviewed in t57 and the interaction pattern selected
for each. Dashboard features use Base UI-backed components from `@lumiere/dashboard-ui` through the
field compositions in `components/ui/dashboard-fields.tsx`.

| Manager workflow | Values | Pattern | Reason |
| --- | --- | --- | --- |
| Create/edit event: event type | 8 stable values | Select | Short, mutually exclusive enum with useful typeahead. |
| Edit event: publish status | 3 stable values | Select | Short enum; contextual help explains the selected status. |
| Event basics: timezone | IANA timezone catalog | Searchable Combobox | Large regional dataset needs filtering, an empty result, and keyboard search. |
| Theme settings: theme mode | Theme-supported subset | Select | Short, compatibility-filtered enum; disabled until a theme is selected. |
| Section editor: visibility | 3 stable values | Select | Short enum with section-specific validation. |
| Section content: answer type | 4 stable values | Select | Short schema enum. |
| Section display: density and supported layouts | 2–3 stable values | Select | Short schema enums. |
| Theme catalog | Compatible theme cards | Card choice, unchanged | Preview and compatibility details are necessary before selection; a dropdown would hide them. |
| Section choice and ordering | Inspectable section cards | Card list, unchanged | Selection is coupled to status, preview, validation, and reorder actions. |

There are no manager multi-select controls in the current dashboard. Navigation/account action menus
are outside this form-control migration and belong to the responsive navigation and user-menu tasks.
