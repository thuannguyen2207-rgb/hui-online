import { Bid, ChatMessage, HuiDay, HuiMember, HuiRound, Transaction, User, P2PLoan, MaturityVault } from '../types';

// Real Database State initialized from Supabase
// All mock arrays are emptied as requested to run exclusively on Supabase records.
export const MOCK_USERS: User[] = [];
export const MOCK_HUI_DAYS: HuiDay[] = [];
export const MOCK_MEMBERS: HuiMember[] = [];
export const MOCK_ROUNDS: HuiRound[] = [];
export const MOCK_BIDS: Bid[] = [];
export const MOCK_TRANSACTIONS: Transaction[] = [];
export const MOCK_CHAT_MESSAGES: ChatMessage[] = [];
export const MOCK_P2P_LOANS: P2PLoan[] = [];
export const MOCK_MATURITY_VAULTS: MaturityVault[] = [];
