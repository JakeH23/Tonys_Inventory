import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Part } from '../models/part.model';

export interface PartListState {
  q: string;
  category: string | null;
  side: string | null;
  pageIndex: number;
  pageSize: number;
  sortActive: string | null;
  sortDirection: 'asc' | 'desc' | '';
  data: Part[] | null;
}

const STORAGE_KEY = 'partListState_v1';

@Injectable({
  providedIn: 'root',
})
export class PartListStateService {
  private defaultState: PartListState = {
    q: '',
    category: null,
    side: null,
    pageIndex: 0,
    pageSize: 5,
    sortActive: null,
    sortDirection: '',
    data: null,
  };

  private state$ = new BehaviorSubject<PartListState>(this.load() ?? this.defaultState);

  get state() {
    return this.state$.asObservable();
  }

  get snapshot(): PartListState {
    return this.state$.getValue();
  }

  setState(partial: Partial<PartListState>) {
    const next = { ...this.state$.getValue(), ...partial };
    this.state$.next(next);
    this.save(next);
  }

  setData(data: Part[]) {
    this.setState({ data });
  }

  clear() {
    this.state$.next(this.defaultState);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  private save(state: PartListState) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore sessionStorage errors
    }
  }

  private load(): PartListState | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as PartListState;
    } catch {
      return null;
    }
  }
}
