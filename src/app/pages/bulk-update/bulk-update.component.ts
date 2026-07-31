import { Component } from '@angular/core';
import { CarService } from '../../services/car.service';
import { CoreService } from '../../components/core/core.service';

interface ParsedBulkUpdateRow {
  rowNumber: number;
  idRaw: string;
  estimatedCostRaw: string;
  dateChangedRaw: string;
  id?: number;
  estimatedCost?: number;
  dateChanged?: string;
  valid: boolean;
  errors: string[];
}

interface BulkUpdateApiResult {
  totalReceived: number;
  totalValidated: number;
  totalApplied: number;
  matchedCount: number;
  modifiedCount: number;
  results: Array<{ Id: number; updated: boolean; reason?: string; estimatedCost?: number; dateChanged?: string }>;
}

@Component({
  selector: 'app-bulk-update',
  templateUrl: './bulk-update.component.html',
  styleUrls: ['./bulk-update.component.scss'],
})
export class BulkUpdateComponent {
  csvText = '';
  parsedRows: ParsedBulkUpdateRow[] = [];
  displayedColumns: string[] = ['rowNumber', 'id', 'estimatedCost', 'dateChanged', 'status'];
  isSubmitting = false;
  parseMessage = '';
  apiResult: BulkUpdateApiResult | null = null;

  constructor(private carService: CarService, private coreService: CoreService) {}

  onCsvInput(value: string) {
    this.csvText = value;
    this.parseMessage = '';
    this.apiResult = null;
  }

  onCsvInputEvent(event: Event) {
    const value = (event.target as HTMLTextAreaElement | null)?.value || '';
    this.onCsvInput(value);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.csvText = String(reader.result || '');
      this.parseCsv();
    };
    reader.onerror = () => {
      this.coreService.openSnackBar('Unable to read file.');
    };
    reader.readAsText(file);
  }

  parseCsv() {
    this.apiResult = null;
    const raw = (this.csvText || '').trim();
    if (!raw) {
      this.parsedRows = [];
      this.parseMessage = 'Paste CSV data or upload a CSV file to begin.';
      return;
    }

    const lines = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length < 2) {
      this.parsedRows = [];
      this.parseMessage = 'CSV must include a header row and at least one data row.';
      return;
    }

    const headers = this.parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
    const idIndex = headers.findIndex((h) => h === 'id');
    const estimatedCostIndex = headers.findIndex((h) => h === 'estimatedcost' || h === 'estimatedvalue');
    const dateChangedIndex = headers.findIndex((h) => h === 'datechanged' || h === 'date' || h === 'datetime');

    if (idIndex === -1 || estimatedCostIndex === -1) {
      this.parsedRows = [];
      this.parseMessage = 'CSV headers must include Id and EstimatedCost (or EstimatedValue).';
      return;
    }

    const rows: ParsedBulkUpdateRow[] = [];

    lines.slice(1).forEach((line, idx) => {
      const values = this.parseCsvLine(line);
      const rowNumber = idx + 2;
      const idRaw = (values[idIndex] || '').trim();
      const estimatedCostRaw = (values[estimatedCostIndex] || '').trim();
      const dateChangedRaw = dateChangedIndex >= 0 ? (values[dateChangedIndex] || '').trim() : '';

      const errors: string[] = [];
      const id = Number(idRaw);
      if (!Number.isInteger(id) || id <= 0) {
        errors.push('Id must be a positive integer.');
      }

      const estimatedCost = Number(estimatedCostRaw);
      if (!Number.isFinite(estimatedCost) || estimatedCost < 0) {
        errors.push('EstimatedCost must be a non-negative number.');
      }

      let dateChanged: string | undefined;
      if (dateChangedRaw) {
        const parsedDate = new Date(dateChangedRaw);
        if (Number.isNaN(parsedDate.getTime())) {
          errors.push('DateChanged must be a valid date-time value.');
        } else {
          dateChanged = parsedDate.toISOString();
        }
      }

      rows.push({
        rowNumber,
        idRaw,
        estimatedCostRaw,
        dateChangedRaw,
        id,
        estimatedCost,
        dateChanged,
        valid: errors.length === 0,
        errors,
      });
    });

    this.parsedRows = rows;

    const validCount = this.validRows.length;
    const invalidCount = this.parsedRows.length - validCount;
    this.parseMessage = `Parsed ${this.parsedRows.length} rows: ${validCount} valid, ${invalidCount} invalid.`;
  }

  runBulkUpdate() {
    if (!this.validRows.length) {
      this.coreService.openSnackBar('No valid rows to submit.');
      return;
    }

    this.isSubmitting = true;
    this.apiResult = null;

    const updates = this.validRows.map((row) => ({
      Id: row.id as number,
      EstimatedCost: row.estimatedCost as number,
      ...(row.dateChanged ? { DateChanged: row.dateChanged } : {}),
    }));

    this.carService.bulkUpdateEstimatedValues(updates, true).subscribe({
      next: (result: BulkUpdateApiResult) => {
        this.apiResult = result;
        this.isSubmitting = false;
        this.coreService.openSnackBar('Bulk update completed.');
      },
      error: (err) => {
        this.isSubmitting = false;
        this.coreService.openSnackBar('Bulk update failed.');
        console.error(err);
      },
    });
  }

  get validRows(): ParsedBulkUpdateRow[] {
    return this.parsedRows.filter((row) => row.valid);
  }

  private parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current);
    return values;
  }
}
