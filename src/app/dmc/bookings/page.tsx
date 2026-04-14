'use client';
import { useEffect, useState } from 'react';

const SUPA = (process.env.NEXT_PUBLIC_SUPABASE_URL || '') + '/functions/v1';

const statusColor: Record<string,string> = {
  pending: '#f5a623', confirmed: '#19C977', in_progress: '#1D9E75',
  completed: '#7aab94', cancelled: '#ff6b6b'
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const dmcId = typeof window !== 'undefined' ? localStorage.getItem('dmc_id') || '' : '';

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await fetch(SUPA + '/create-booking?action=list&dmc_id=' + dmcId);
    // For now just show empty — real list needs a list endpoint
    setBookings([]);
    setLoading(false);
  }

  const pg: React.CSSProperties = { minHeight:'100vh', background:'#07100D', color:'#e8f5f0', fontFamily:'Inter,sans-serif', padding:'20px' };

  return (
    <div style={pg}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:800, margin:0 }}>Bookings</h1>
        <a href="/dmc/bookings/create" style={{ background:'#19C977', color:'#07100D', textDecoration:'none', borderRadius:8, padding:'10px 18px', fontWeight:700, fontSize:14 }}>+ New Booking</a>
      </div>
      {loading ? <div style={{ textAlign:'center', color:'#7aab94', padding:'40px 0' }}>Loading...</div>
        : bookings.length === 0 ? (
          <div style={{ textAlign:'center', color:'#7aab94', padding:'60px 0' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📋</div>
            <div style={{ fontSize:18, fontWeight:600, marginBottom:8 }}>No bookings yet</div>
            <div style={{ fontSize:14, marginBottom:20 }}>Create your first booking to get started</div>
            <a href="/dmc/bookings/create" style={{ background:'#19C977', color:'#07100D', textDecoration:'none', borderRadius:8, padding:'12px 24px', fontWeight:700, fontSize:14 }}>Create Booking</a>
          </div>
        ) : null}
    </div>
  );
}