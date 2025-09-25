import { createContext, useContext, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';

export type Sku = { id: string; title: string; price: number; inventory: number };
export type Campaign = { id: string; name: string; status: 'draft' | 'scheduled' | 'active'; discount?: number };
export type CartItem = { skuId: string; qty: number };
export type User = { id: string; name: string; role: 'admin' | 'viewer' };
export type Activity = { id: string; type: string; message: string; at: string };
export type Ticket = { id: string; subject: string; status: 'open' | 'in_progress' | 'closed'; priority: 'low' | 'medium' | 'high'; createdAt: string };

export type State = {
  skus: Sku[];
  campaigns: Campaign[];
  cart: CartItem[];
  rewards: { dailyAvailable: boolean; points: number; tier: 'Bronze' | 'Silver' | 'Gold' };
  locale: string;
  users: User[];
  currentUserId: string;
  activity: Activity[];
  tickets: Ticket[];
  consent: { marketing: boolean; analytics: boolean; personalization: boolean };
  ageGate: { required: boolean; verified: boolean; dob?: string };
};

const initialState: State = {
  skus: [
    { id: 'sku-1', title: 'Gem Pack Small', price: 4.99, inventory: 999 },
    { id: 'sku-2', title: 'Gem Pack Large', price: 19.99, inventory: 250 },
  ],
  campaigns: [
    { id: 'cmp-1', name: 'Fall Sale', status: 'active', discount: 20 },
  ],
  cart: [],
  rewards: { dailyAvailable: true, points: 1250, tier: 'Gold' },
  locale: 'en',
  users: [
    { id: 'u-1', name: 'Admin Alice', role: 'admin' },
    { id: 'u-2', name: 'Viewer Victor', role: 'viewer' },
  ],
  currentUserId: 'u-1',
  activity: [
    { id: 'a-1', type: 'login', message: 'Admin Alice logged in', at: new Date().toISOString() },
  ],
  tickets: [
    { id: 't-1', subject: 'Email template bug', status: 'open', priority: 'medium', createdAt: new Date().toISOString() },
  ],
  consent: { marketing: true, analytics: true, personalization: true },
  ageGate: { required: false, verified: true },
};

export type Action =
  | { type: 'ADD_TO_CART'; skuId: string; qty: number }
  | { type: 'CHECKOUT' }
  | { type: 'CREATE_CAMPAIGN'; payload: Omit<Campaign, 'id' | 'status'> & { status?: Campaign['status'] } }
  | { type: 'UPDATE_SKU_PRICE'; skuId: string; price: number }
  | { type: 'VALIDATE_PROMO'; code: string }
  | { type: 'CLAIM_DAILY_REWARD' }
  | { type: 'ADD_LOYALTY_POINTS'; points: number }
  | { type: 'SET_LOCALE'; locale: string }
  | { type: 'SET_USER_ROLE'; userId: string; role: User['role'] }
  | { type: 'LOG_ACTIVITY'; payload: Omit<Activity, 'id' | 'at'> & { at?: string } }
  | { type: 'CREATE_TICKET'; payload: Omit<Ticket, 'id' | 'status' | 'createdAt'> & { priority: Ticket['priority'] } }
  | { type: 'UPDATE_TICKET_STATUS'; ticketId: string; status: Ticket['status'] }
  | { type: 'SET_CONSENT'; payload: Partial<State['consent']> }
  | { type: 'SET_AGEGATE'; payload: Partial<State['ageGate']> };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const exists = state.cart.find(c => c.skuId === action.skuId);
      const cart = exists
        ? state.cart.map(c => (c.skuId === action.skuId ? { ...c, qty: c.qty + action.qty } : c))
        : [...state.cart, { skuId: action.skuId, qty: action.qty }];
      return { ...state, cart };
    }
    case 'CHECKOUT': {
      return { ...state, cart: [] };
    }
    case 'CREATE_CAMPAIGN': {
      const id = `cmp-${state.campaigns.length + 1}`;
      const status = action.payload.status ?? 'scheduled';
      return { ...state, campaigns: [...state.campaigns, { id, status, ...action.payload }] };
    }
    case 'UPDATE_SKU_PRICE': {
      return { ...state, skus: state.skus.map(s => (s.id === action.skuId ? { ...s, price: action.price } : s)) };
    }
    case 'VALIDATE_PROMO': {
      return { ...state, rewards: { ...state.rewards, points: state.rewards.points + 50 } };
    }
    case 'CLAIM_DAILY_REWARD': {
      if (!state.rewards.dailyAvailable) return state;
      return { ...state, rewards: { ...state.rewards, dailyAvailable: false, points: state.rewards.points + 100 } };
    }
    case 'ADD_LOYALTY_POINTS': {
      const points = state.rewards.points + action.points;
      const tier = points >= 1200 ? 'Gold' : points >= 600 ? 'Silver' : 'Bronze';
      return { ...state, rewards: { ...state.rewards, points, tier } };
    }
    case 'SET_LOCALE': {
      return { ...state, locale: action.locale };
    }
    case 'SET_USER_ROLE': {
      return { ...state, users: state.users.map(u => (u.id === action.userId ? { ...u, role: action.role } : u)) };
    }
    case 'LOG_ACTIVITY': {
      const item: Activity = { id: `a-${state.activity.length + 1}`, type: action.payload.type, message: action.payload.message, at: action.payload.at ?? new Date().toISOString() };
      return { ...state, activity: [item, ...state.activity] };
    }
    case 'CREATE_TICKET': {
      const item: Ticket = { id: `t-${state.tickets.length + 1}`, subject: action.payload.subject, status: 'open', priority: action.payload.priority, createdAt: new Date().toISOString() };
      return { ...state, tickets: [item, ...state.tickets] };
    }
    case 'UPDATE_TICKET_STATUS': {
      return { ...state, tickets: state.tickets.map(t => (t.id === action.ticketId ? { ...t, status: action.status } : t)) };
    }
    case 'SET_CONSENT': {
      return { ...state, consent: { ...state.consent, ...action.payload } };
    }
    case 'SET_AGEGATE': {
      return { ...state, ageGate: { ...state.ageGate, ...action.payload } };
    }
    default:
      return state;
  }
}

const StoreContext = createContext<{ state: State; dispatch: (a: Action) => void } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('Store not available');
  return ctx;
}
