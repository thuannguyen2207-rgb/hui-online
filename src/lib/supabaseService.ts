import { supabase } from './supabase';
import { HuiDay, HuiMember, HuiRound, Transaction, User, Bid } from '../types';

// ==========================================
// 1. PROFILES / USERS
// ==========================================
export async function fetchUsersFromSupabase(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      const { data: usersData, error: usersErr } = await supabase
        .from('users')
        .select('*');
      
      if (usersErr || !usersData) return [];
      return usersData.map(mapDbUserToUser);
    }

    return data.map(mapDbUserToUser);
  } catch (err) {
    console.warn('Supabase fetchUsers exception:', err);
    return [];
  }
}

export async function upsertUserInSupabase(user: User): Promise<boolean> {
  try {
    const payload = {
      id: user.id,
      phone: user.phone,
      email: user.email || null,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      verified: user.verified ?? true,
      account_approval_status: user.accountApprovalStatus || 'approved',
      bank_name: user.bankName || user.bankConfig?.bankName || null,
      bank_code: user.bankCode || user.bankConfig?.bankCode || null,
      account_number: user.accountNumber || user.bankConfig?.accountNumber || null,
      account_name: user.accountName || user.bankConfig?.accountName || null,
      address: user.address || null,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('First profile upsert failed, attempting fallback on profiles/users:', error.message || error);
      
      // Fallback 1: Minimal payload on profiles (in case some optional columns like address/bank_code don't exist in DB schema)
      const minimalPayload = {
        id: user.id,
        phone: user.phone,
        email: user.email || null,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        updated_at: new Date().toISOString()
      };

      const { error: minErr } = await supabase
        .from('profiles')
        .upsert(minimalPayload, { onConflict: 'id' });

      if (minErr) {
        // Fallback 2: Try users table if profiles table is named 'users' in Supabase
        await supabase
          .from('users')
          .upsert(minimalPayload, { onConflict: 'id' });
      }
    }
    return true;
  } catch (err) {
    console.warn('Upsert user exception caught safely:', err);
    return false;
  }
}

export async function updateUserApprovalStatusInSupabase(
  userId: string, 
  status: 'approved' | 'pending_approval' | 'rejected'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ account_approval_status: status })
      .eq('id', userId);

    if (error) {
      console.error('Error updating approval status in Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Update approval status exception:', err);
    return false;
  }
}

function mapDbUserToUser(row: any): User {
  const bankName = row.bank_name || row.bankName || undefined;
  const bankCode = row.bank_code || row.bankCode || 'MB';
  const accountNumber = row.account_number || row.accountNumber || undefined;
  const accountName = row.account_name || row.accountName || undefined;

  const bankConfig = (bankName || accountNumber) ? {
    bankName: bankName || 'MB Bank',
    bankCode: bankCode || 'MB',
    accountNumber: accountNumber || '',
    accountName: accountName || row.name || ''
  } : undefined;

  return {
    id: row.id || `u_${Date.now()}`,
    phone: row.phone || '0908000000',
    email: row.email || undefined,
    name: row.name || 'Hội Viên',
    role: row.role === 'chu_hui' ? 'chu_hui' : 'hui_vien',
    avatar: row.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    verified: row.verified ?? true,
    accountApprovalStatus: row.account_approval_status || row.accountApprovalStatus || 'approved',
    registeredAt: row.registered_at || row.created_at || new Date().toISOString(),
    bankName,
    bankCode,
    accountNumber,
    accountName,
    bankConfig,
    address: row.address || undefined
  };
}


// ==========================================
// 2. HUI GROUPS / HUI DAYS
// ==========================================
export async function fetchHuiDaysFromSupabase(): Promise<HuiDay[]> {
  try {
    const { data, error } = await supabase
      .from('hui_groups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(mapDbHuiGroupToHuiDay);
  } catch (err) {
    console.warn('Supabase fetchHuiDays exception:', err);
    return [];
  }
}

export async function createHuiDayInSupabase(huiDay: HuiDay): Promise<boolean> {
  try {
    const payload = {
      id: huiDay.id,
      name: huiDay.name,
      host_id: huiDay.hostId,
      host_name: huiDay.hostName,
      host_phone: huiDay.hostPhone,
      total_shares: huiDay.totalShares,
      share_amount: huiDay.shareAmount,
      cycle_type: huiDay.cycleType,
      cycle_days: huiDay.cycleDays,
      fee_type: huiDay.feeType,
      fee_value: huiDay.feeValue,
      min_bid_type: huiDay.minBidType,
      min_bid_value: huiDay.minBidValue,
      max_bid_type: huiDay.maxBidType,
      max_bid_value: huiDay.maxBidValue,
      tie_break_rule: huiDay.tieBreakRule,
      start_date: huiDay.startDate,
      current_round: huiDay.currentRound,
      status: huiDay.status,
      invite_code: huiDay.inviteCode,
      bank_name: huiDay.bankConfig?.bankName,
      bank_code: huiDay.bankConfig?.bankCode,
      account_number: huiDay.bankConfig?.accountNumber,
      account_name: huiDay.bankConfig?.accountName,
      description: huiDay.description || '',
      created_at: huiDay.createdAt || new Date().toISOString()
    };

    const { error } = await supabase
      .from('hui_groups')
      .insert(payload);

    if (error) {
      console.error('Error inserting hui_group to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Create hui_group exception:', err);
    return false;
  }
}

function mapDbHuiGroupToHuiDay(row: any): HuiDay {
  return {
    id: row.id,
    name: row.name || 'Dây Hụi',
    hostId: row.host_id || row.hostId || 'u_chu_hui',
    hostName: row.host_name || row.hostName || 'Chủ Hụi',
    hostPhone: row.host_phone || row.hostPhone || '0908123456',
    totalShares: Number(row.total_shares || row.totalShares || 10),
    shareAmount: Number(row.share_amount || row.shareAmount || 1000000),
    cycleType: row.cycle_type || row.cycleType || 'monthly',
    cycleDays: Number(row.cycle_days || row.cycleDays || 30),
    feeType: row.fee_type || row.feeType || 'percent_payout',
    feeValue: Number(row.fee_value || row.feeValue || 2),
    minBidType: row.min_bid_type || row.minBidType || 'amount',
    minBidValue: Number(row.min_bid_value || row.minBidValue || 50000),
    maxBidType: row.max_bid_type || row.maxBidType || 'amount',
    maxBidValue: Number(row.max_bid_value || row.maxBidValue || 500000),
    tieBreakRule: row.tie_break_rule || row.tieBreakRule || 'random',
    startDate: row.start_date || row.startDate || new Date().toISOString(),
    currentRound: Number(row.current_round || row.currentRound || 1),
    status: row.status || 'active',
    inviteCode: row.invite_code || row.inviteCode || 'HUI888',
    bankConfig: {
      bankName: row.bank_name || 'MB Bank',
      bankCode: row.bank_code || 'MB',
      accountNumber: row.account_number || '0908123456888',
      accountName: row.account_name || 'NGUYEN VAN AN'
    },
    description: row.description || undefined,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    allowP2pLending: row.allow_p2p_lending ?? true,
    allowMaturityVault: row.allow_maturity_vault ?? true
  };
}


// ==========================================
// 3. HUI MEMBERS
// ==========================================
export async function fetchMembersFromSupabase(huiDayId?: string): Promise<HuiMember[]> {
  try {
    let query = supabase.from('hui_members').select('*');
    if (huiDayId) {
      query = query.eq('hui_day_id', huiDayId);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map(row => ({
      id: row.id,
      huiDayId: row.hui_day_id || row.huiDayId,
      userId: row.user_id || row.userId,
      userName: row.user_name || row.userName || row.name || 'Hội Viên',
      userPhone: row.user_phone || row.userPhone || row.phone || '0900000000',
      userAvatar: row.user_avatar || row.userAvatar || row.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      sharesCount: Number(row.shares_count || row.sharesCount || 1),
      hasPayout: row.has_payout ?? (row.state === 'da_hot'),
      payoutRound: row.payout_round ? Number(row.payout_round) : null,
      joinedAt: row.joined_at || row.createdAt || new Date().toISOString(),
      status: row.status || 'approved',
      note: row.note || undefined
    }));
  } catch (err) {
    console.warn('Supabase fetchMembers exception:', err);
    return [];
  }
}

export async function addMemberToSupabase(member: HuiMember): Promise<boolean> {
  try {
    const { error } = await supabase.from('hui_members').insert({
      id: member.id,
      hui_day_id: member.huiDayId,
      user_id: member.userId,
      user_name: member.userName,
      user_phone: member.userPhone,
      user_avatar: member.userAvatar,
      shares_count: member.sharesCount,
      has_payout: member.hasPayout,
      payout_round: member.payoutRound,
      joined_at: member.joinedAt || new Date().toISOString(),
      status: member.status
    });
    return !error;
  } catch (err) {
    return false;
  }
}


// ==========================================
// 4. TRANSACTIONS
// ==========================================
export async function fetchTransactionsFromSupabase(huiDayId?: string): Promise<Transaction[]> {
  try {
    let query = supabase.from('transactions').select('*').order('created_at', { ascending: false });
    if (huiDayId) {
      query = query.eq('hui_day_id', huiDayId);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map(row => ({
      id: row.id,
      roundId: row.round_id || row.roundId || `round_${row.hui_day_id}_1`,
      huiDayId: row.hui_day_id || row.huiDayId,
      memberId: row.member_id || row.memberId,
      userId: row.user_id || row.userId || 'u_mem',
      userName: row.user_name || row.userName || row.member_name || 'Hội Viên',
      sharesCount: Number(row.shares_count || row.sharesCount || 1),
      isDeadHui: row.is_dead_hui ?? false,
      amountDue: Number(row.amount_due || row.amount || 0),
      status: row.status || 'unpaid',
      paymentProofUrl: row.payment_proof_url || row.paymentProofUrl || undefined,
      vietqrCode: row.vietqr_code || row.vietqrCode || '',
      paymentRef: row.payment_ref || row.paymentRef || `HUI_${row.hui_day_id}`,
      paidAt: row.paid_at || row.paidAt || undefined,
      confirmedAt: row.confirmed_at || row.confirmedAt || undefined
    }));
  } catch (err) {
    console.warn('Supabase fetchTransactions exception:', err);
    return [];
  }
}

export async function createTransactionInSupabase(tx: Transaction): Promise<boolean> {
  try {
    const { error } = await supabase.from('transactions').insert({
      id: tx.id,
      round_id: tx.roundId,
      hui_day_id: tx.huiDayId,
      member_id: tx.memberId,
      user_id: tx.userId,
      user_name: tx.userName,
      shares_count: tx.sharesCount,
      is_dead_hui: tx.isDeadHui,
      amount_due: tx.amountDue,
      status: tx.status,
      payment_ref: tx.paymentRef,
      vietqr_code: tx.vietqrCode,
      created_at: new Date().toISOString()
    });
    return !error;
  } catch (err) {
    return false;
  }
}

export async function updateTransactionStatusInSupabase(txId: string, status: Transaction['status']): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('transactions')
      .update({ status, confirmed_at: new Date().toISOString() })
      .eq('id', txId);
    return !error;
  } catch (err) {
    return false;
  }
}
