import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CarListState {
  filter: string;
  pageIndex: number;
  pageSize: number;
  sortActive: string | null;
  sortDirection: 'asc' | 'desc' | '';
  data: any[] | null;
}

const STORAGE_KEY = 'carListState_v1';

@Injectable({
  providedIn: 'root',
})
export class CarListStateService {
  private defaultState: CarListState = {
    filter: '',
    pageIndex: 0,
    pageSize: 10,
    sortActive: null,
    sortDirection: '',
    data: null,
  };

  private state$ = new BehaviorSubject<CarListState>(this.load() ?? this.defaultState);

  // Observable for components that want to react to state changes
  get state() {
    return this.state$.asObservable();
  }

  get snapshot(): CarListState {
    return this.state$.getValue();
  }

  setState(partial: Partial<CarListState>) {
    const next = { ...this.state$.getValue(), ...partial };
    this.state$.next(next);
    this.save(next);
  }

  setData(data: any[]) {
    this.setState({ data });
  }

  clear() {
    this.state$.next(this.defaultState);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  private save(state: CarListState) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore sessionStorage errors (private mode)
    }
  }

  private load(): CarListState | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as CarListState;
    } catch {
      return null;
    }
  }
}