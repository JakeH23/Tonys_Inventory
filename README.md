# CrudApp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.0.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Bulk Update Car Estimated Values

Use this endpoint to bulk update car estimated values and automatically append value history entries.

- Endpoint: `POST /api/cars/bulk-estimated-values`
- Body:

```json
{
	"updates": [
		{ "Id": 1, "EstimatedCost": 190.5, "DateChanged": "2026-07-31T08:00:00.000Z" },
		{ "Id": 2, "EstimatedCost": 45 }
	],
	"skipIfSame": true
}
```

Notes:
- `Id` is required and must match the car `Id` field.
- `EstimatedCost` is required and must be a non-negative number.
- `DateChanged` is optional. If omitted, server uses the current date-time.
- `skipIfSame` defaults to `true`; when true, if the newest existing value is already the same, no new history row is appended.

Recommended input format from spreadsheets:
- CSV columns: `Id,EstimatedCost,DateChanged`
- Keep `DateChanged` in ISO-8601 format when provided, for example `2026-07-31T08:00:00.000Z`.
