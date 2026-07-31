import { EstimatedValueEntry } from './estimated-value.model';

export interface Car {
  Id?: number;
  ManufacturersCode?: string;
  Make?: string;
  Model?: string;
  EstimatedValue?: EstimatedValueEntry[];
  Boxed?: boolean;
  Notes?: string;
  Image?: string;
}
