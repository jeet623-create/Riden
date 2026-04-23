import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

// v9: 30-minute TTL for abandoned registration flows — prevents stale in_progress
// rows from blocking a fresh REGISTER after a user drops off mid-flow.
async function abandonStaleFlows(lineUserId: string) {
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  await sb.from('registration_flow')
    .update({ status: 'abandoned', updated_at: new Date().toISOString() })
    .eq('line_user_id', lineUserId)
    .eq('status', 'in_progress')
    .lt('updated_at', thirtyMinAgo);
}

async function getLineToken(): Promise<string> {
  const { data } = await sb.from('app_config').select('value').eq('key','LINE_CHANNEL_ACCESS_TOKEN').single();
  return data?.value ?? '';
}
async function sendLine(to: string, messages: unknown[]) {
  const token = await getLineToken();
  await fetch('https://api.line.me/v2/bot/message/push', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body:JSON.stringify({ to, messages }) });
}
async function sendText(to: string, text: string) { await sendLine(to, [{ type:'text', text }]); }

function vehicleTypeButtons(lineUserId: string, action = 'reg_vehicle') {
  return [{ type:'flex', altText:'เลือกประเภทรถ', contents:{ type:'bubble', body:{ type:'box', layout:'vertical', spacing:'sm', contents:[{ type:'text', text:'🚗 เลือกประเภทรถ', weight:'bold', size:'md' }]}, footer:{ type:'box', layout:'vertical', spacing:'sm', contents:[
    { type:'button', action:{ type:'postback', label:'🚗 Sedan', data:`action=${action}&uid=${lineUserId}&type=sedan` }, style:'secondary', height:'sm' },
    { type:'button', action:{ type:'postback', label:'🚙 SUV', data:`action=${action}&uid=${lineUserId}&type=suv` }, style:'secondary', height:'sm' },
    { type:'button', action:{ type:'postback', label:'🚐 แวน 9 ที่นั่ง', data:`action=${action}&uid=${lineUserId}&type=van_9` }, style:'primary', color:'#1D9E75', height:'sm' },
    { type:'button', action:{ type:'postback', label:'🚐 แวน 12 ที่นั่ง', data:`action=${action}&uid=${lineUserId}&type=van_12` }, style:'secondary', height:'sm' },
    { type:'button', action:{ type:'postback', label:'🚌 มินิบัส 15', data:`action=${action}&uid=${lineUserId}&type=minibus_15` }, style:'secondary', height:'sm' },
    { type:'button', action:{ type:'postback', label:'🚌 มินิบัส 20', data:`action=${action}&uid=${lineUserId}&type=minibus_20` }, style:'secondary', height:'sm' },
    { type:'button', action:{ type:'postback', label:'🚍 รถโค้ช 30+', data:`action=${action}&uid=${lineUserId}&type=coach_30` }, style:'secondary', height:'sm' },
    { type:'button', action:{ type:'postback', label:'🚚 กระบะ', data:`action=${action}&uid=${lineUserId}&type=pickup` }, style:'secondary', height:'sm' }
  ]} } }];
}
function alsoDriverButtons(lineUserId: string) {
  return [{ type:'flex', altText:'ขับเองด้วยไหม?', contents:{ type:'bubble', body:{ type:'box', layout:'vertical', spacing:'sm', contents:[
    { type:'text', text:'🚗 คุณขับรถเองด้วยไหม?', weight:'bold', size:'lg' },
    { type:'text', text:'RIDEN จะส่งงานหาทั้งสองทาง', size:'sm', color:'#555555', wrap:true }
  ]}, footer:{ type:'box', layout:'vertical', spacing:'sm', contents:[
    { type:'button', action:{ type:'postback', label:'✅ ใช่ – ฉันขับเอง', data:`action=op_also_driver&uid=${lineUserId}&val=yes` }, style:'primary', color:'#1D9E75' },
    { type:'button', action:{ type:'postback', label:'❌ ไม่ – มีคนขับอยู่แล้ว', data:`action=op_also_driver&uid=${lineUserId}&val=no` }, style:'secondary' }
  ]} } }];
}
function registrationTypeButtons() {
  return [{ type:'flex', altText:'สมัคร RIDEN', contents:{ type:'bubble',
    header:{ type:'box', layout:'vertical', backgroundColor:'#1D9E75', paddingAll:'16px', contents:[
      { type:'text', text:'🚗 ยินดีต้อนรับสู่ RIDEN', color:'#ffffff', weight:'bold', size:'xl' }
    ]},
    body:{ type:'box', layout:'vertical', spacing:'sm', contents:[{ type:'text', text:'คุณต้องการสมัครในฐานะ?', weight:'bold', size:'md' }]},
    footer:{ type:'box', layout:'vertical', spacing:'sm', contents:[
      { type:'button', action:{ type:'postback', label:'🏢 ผู้ประกอบการ (มีรถ)', data:'action=start_reg&type=operator' }, style:'primary', color:'#1D9E75' },
      { type:'button', action:{ type:'postback', label:'🧑‍✈️ คนขับรถ', data:'action=start_reg&type=driver' }, style:'secondary' }
    ]} } }];
}

async function getFlow(lineUserId: string) {
  const { data } = await sb.from('registration_flow').select('*').eq('line_user_id', lineUserId).eq('status','in_progress').single();
  return data;
}
async function createFlow(lineUserId: string, type: string, step?: string) {
  await sb.from('registration_flow').delete().eq('line_user_id', lineUserId).eq('status','in_progress');
  const defaultStep = type === 'operator' ? 'op_company_name' : type === 'driver' ? 'dr_full_name' : 'veh_type';
  const { data } = await sb.from('registration_flow').insert({ line_user_id:lineUserId, status:'in_progress', step:step??defaultStep, data:{ type } }).select().single();
  return data;
}
async function updateFlow(lineUserId: string, step: string, extraData: Record<string, unknown>) {
  const flow = await getFlow(lineUserId);
  if (!flow) return null;
  const { data } = await sb.from('registration_flow').update({ step, data:{ ...flow.data, ...extraData }, updated_at:new Date().toISOString() }).eq('id', flow.id).select().single();
  return data;
}
async function completeFlow(lineUserId: string) {
  await sb.from('registration_flow').update({ status:'completed', updated_at:new Date().toISOString() }).eq('line_user_id', lineUserId).eq('status','in_progress');
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status:405 });
  try {
    const body = await req.json();
    const { lineUserId, text } = body;
    const action = body.action;
    const params = body.params as Record<string, string> | undefined;
    if (!lineUserId) return new Response(JSON.stringify({ error:'Missing lineUserId' }), { status:400 });
    if (action) { await handlePostback(lineUserId, action, params??{}); return new Response(JSON.stringify({ ok:true }), { status:200 }); }
    await handleText(lineUserId, (text??'').trim());
    return new Response(JSON.stringify({ ok:true }), { status:200 });
  } catch(err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error:msg }), { status:500 });
  }
});

async function handlePostback(lineUserId: string, action: string, params: Record<string, string>) {
  if (action === 'start_reg') {
    await abandonStaleFlows(lineUserId);
    await createFlow(lineUserId, params.type);
    if (params.type === 'operator') await sendText(lineUserId, '🏢 สมัครผู้ประกอบการ\n\nพิมพ์ ชื่อบริษัท/ร้าน');
    else await sendText(lineUserId, '🧑‍✈️ สมัครคนขับรถ\n\nพิมพ์ ชื่อ-นามสกุล');
    return;
  }
  if (action === 'op_also_driver') {
    const uid = params.uid||lineUserId;
    if (params.val === 'yes') { await updateFlow(uid, 'op_driver_fullname', { is_also_driver:true }); await sendText(uid, '👤 ชื่อ-นามสกุลของคนขับ?'); }
    else { await finishOperatorRegistration(uid, false); }
    return;
  }
  if (action === 'op_vehicle') { const uid=params.uid||lineUserId; await updateFlow(uid, 'op_plate', { op_vehicle_type:params.type }); await sendText(uid, `✅ เลือก: ${vL()[params.type]||params.type}\n\nพิมพ์ ทะเบียนรถ`); return; }
  if (action === 'reg_vehicle') { const uid=params.uid||lineUserId; await updateFlow(uid, 'dr_plate', { vehicle_type:params.type }); await sendText(uid, `✅ เลือก: ${vL()[params.type]||params.type}\n\nพิมพ์ ทะเบียนรถ`); return; }
  if (action === 'add_vehicle_type') { const uid=params.uid||lineUserId; await updateFlow(uid, 'veh_brand', { veh_type:params.type }); await sendText(uid, `✅ ประเภท: ${vL()[params.type]||params.type}\n\nพิมพ์ ยี่ห้อ+รุ่นรถ`); return; }

  // v9: photo-handler calls this after operator uploads vehicle photo
  if (action === 'finish_operator') {
    const uid = params.uid || lineUserId;
    const flow = await getFlow(uid);
    const isAlsoDriver = !!(flow?.data?.is_also_driver);
    await finishOperatorRegistration(uid, isAlsoDriver);
    return;
  }

  // v9: photo-handler calls this after driver uploads license photo
  if (action === 'show_vehicle_types') {
    const uid = params.uid || lineUserId;
    await sendLine(uid, vehicleTypeButtons(uid, 'reg_vehicle'));
    await sendText(uid, '🚗 เลือกประเภทรถของคุณ');
    return;
  }

  // v9: user clicked "Add another vehicle" after completing registration
  if (action === 'add_another_vehicle') {
    const uid = params.uid || lineUserId;
    const { data: op } = await sb.from('operators').select('id').eq('line_user_id', uid).single();
    if (!op) {
      await sendText(uid, '⚠️ ไม่พบข้อมูลผู้ประกอบการ');
      return;
    }
    await startAddVehicleFlow(uid, op.id);
    return;
  }

  // v9: user clicked "Done adding vehicles"
  if (action === 'done_adding_vehicles') {
    const uid = params.uid || lineUserId;
    await completeFlow(uid);
    await sendText(uid, '✅ เรียบร้อยแล้ว!\n\n⏳ Admin จะยืนยันภายใน 24 ชั่วโมง');
    return;
  }
}

async function handleText(lineUserId: string, text: string) {
  await abandonStaleFlows(lineUserId);
  const upper = text.toUpperCase();
  if (upper==='REGISTER'||upper==='OPERATOR'||upper==='สมัคร'||upper==='สมัครผู้ประกอบการ'||upper==='FOLLOW') { await sendLine(lineUserId, registrationTypeButtons()); return; }
  if (upper==='DRIVER'||upper==='สมัครคนขับ') { await createFlow(lineUserId,'driver'); await sendText(lineUserId,'🧑‍✈️ สมัครคนขับรถ\n\nพิมพ์ ชื่อ-นามสกุล'); return; }
  if (upper==='ADD VEHICLE'||upper==='เพิ่มรถ'||upper==='เพิ่มยานพาหนะ') { const { data:op } = await sb.from('operators').select('id').eq('line_user_id',lineUserId).single(); if (!op) { await sendLine(lineUserId,registrationTypeButtons()); return; } await startAddVehicleFlow(lineUserId,op.id); return; }
  const flow = await getFlow(lineUserId);
  if (!flow) { await sendLine(lineUserId,registrationTypeButtons()); return; }
  const type = flow.data?.type, step = flow.step;
  if (type==='operator') await handleOperatorStep(lineUserId,step,text,flow.data);
  else if (type==='driver') await handleDriverStep(lineUserId,step,text,flow.data);
  else if (type==='add_vehicle') await handleAddVehicleStep(lineUserId,step,text,flow.data);
}

async function startAddVehicleFlow(lineUserId: string, operatorId: string) {
  const { count } = await sb.from('vehicles').select('id',{count:'exact',head:true}).eq('operator_id',operatorId);
  await createFlow(lineUserId,'add_vehicle','veh_type');
  await updateFlow(lineUserId,'veh_type',{ operator_id:operatorId, vehicle_count:(count??0)+1 });
  await sendLine(lineUserId,vehicleTypeButtons(lineUserId,'add_vehicle_type'));
  await sendText(lineUserId,`🚗 เพิ่มรถคันที่ ${(count??0)+1}`);
}

async function handleAddVehicleStep(lineUserId: string, step: string, text: string, data: Record<string, unknown>) {
  if (step==='veh_brand') { await updateFlow(lineUserId,'veh_plate',{ veh_brand:text }); await sendText(lineUserId,`✅ ยี่ห้อ: ${text}\n\nพิมพ์ ทะเบียนรถ`); }
  else if (step==='veh_plate') { await updateFlow(lineUserId,'veh_photo',{ veh_plate:text }); await sendText(lineUserId,`✅ ทะเบียน: ${text}\n\n📸 ถ่ายรูปภาพรถ (หน้ารถให้เห็นทะเบียน)`); }
  else if (step==='veh_photo') { await sendText(lineUserId,'📸 กรุณาถ่ายรูปภาพรถ'); }
  else if (step==='veh_seats') {
    const seats=parseInt(text)||4; const d={...data,veh_seats:seats};
    const { error } = await sb.from('vehicles').insert({ operator_id:d.operator_id, type:d.veh_type, brand_model:d.veh_brand, plate:d.veh_plate, seats, photo_url:d.vehicle_photo_url||null, status:'active', is_active:true });
    if (error) { await sendText(lineUserId,`❌ ${error.message}`); return; }
    await completeFlow(lineUserId);
    await sendLine(lineUserId,[{ type:'flex', altText:'เพิ่มรถสำเร็จ!', contents:{ type:'bubble',
      header:{ type:'box', layout:'vertical', backgroundColor:'#1D9E75', paddingAll:'14px', contents:[{ type:'text', text:'✅ เพิ่มรถสำเร็จ!', color:'#ffffff', weight:'bold', size:'lg' }]},
      body:{ type:'box', layout:'vertical', spacing:'md', contents:[
        { type:'box', layout:'baseline', contents:[{ type:'text', text:'ทะเบียน', color:'#888888', size:'sm', flex:3 }, { type:'text', text:String(d.veh_plate), color:'#111111', size:'sm', flex:5 }]},
      ]},
      footer:{ type:'box', layout:'vertical', spacing:'sm', contents:[
        { type:'button', action:{ type:'postback', label:'➕ เพิ่มรถคันต่อไป', data:`action=add_another_vehicle&uid=${lineUserId}` }, style:'primary', color:'#1D9E75' },
        { type:'button', action:{ type:'postback', label:'✅ เสร็จแล้ว', data:`action=done_adding_vehicles&uid=${lineUserId}` }, style:'secondary' }
      ]} } }]);
  }
}

async function handleOperatorStep(lineUserId: string, step: string, text: string, data: Record<string, unknown>) {
  if (step==='op_company_name') { await updateFlow(lineUserId,'op_phone',{ company_name:text }); await sendText(lineUserId,`✅ ชื่อบริษัท: ${text}\n\nพิมพ์ เบอร์โทร`); }
  else if (step==='op_phone') { await updateFlow(lineUserId,'op_location',{ phone:text }); await sendText(lineUserId,`✅ เบอร์โทร: ${text}\n\nพื้นที่ให้บริการหลัก?`); }
  else if (step==='op_location') { await updateFlow(lineUserId,'op_also_driver',{ base_location:text }); await sendLine(lineUserId,alsoDriverButtons(lineUserId)); }
  else if (step==='op_driver_fullname') { await updateFlow(lineUserId,'op_vehicle_type',{ op_driver_fullname:text }); await sendLine(lineUserId,vehicleTypeButtons(lineUserId,'op_vehicle')); await sendText(lineUserId,`✅ ชื่อคนขับ: ${text} — เลือกประเภทรถ`); }
  else if (step==='op_plate') { await updateFlow(lineUserId,'op_vehicle_photo',{ op_vehicle_plate:text }); await sendText(lineUserId,`✅ ทะเบียน: ${text}\n\n📸 ถ่ายรูปภาพรถ`); }
  else if (step==='op_vehicle_photo') { await sendText(lineUserId,'📸 กรุณาถ่ายรูปภาพรถ ไม่ใช่ตัวอักษร'); }
}

async function finishOperatorRegistration(lineUserId: string, isAlsoDriver: boolean) {
  const flow = await getFlow(lineUserId);
  if (!flow) return;
  const d = flow.data;
  const { data:opData, error:opErr } = await sb.from('operators').insert({ company_name:d.company_name, phone:d.phone, base_location:d.base_location, line_user_id:lineUserId, status:'inactive', is_verified:false, is_also_driver:isAlsoDriver }).select().single();
  if (opErr) { await sendText(lineUserId,opErr.code==='23505'?'⚠️ เคยลงทะเบียนแล้ว':`❌ ${opErr.message}`); return; }
  if (isAlsoDriver && d.op_vehicle_type) {
    const driverName = d.op_driver_fullname||d.company_name;
    const { data:drData } = await sb.from('drivers').insert({ full_name:driverName, line_user_id:lineUserId, vehicle_type:d.op_vehicle_type, vehicle_plate:d.op_vehicle_plate||'', base_location:d.base_location, home_base_location:d.base_location, operator_id:opData?.id||null, is_verified:false, is_active:false, is_available:false }).select().single();
    if (opData?.id && d.op_vehicle_plate) await sb.from('vehicles').insert({ operator_id:opData.id, type:d.op_vehicle_type, brand_model:String(d.op_vehicle_type), plate:d.op_vehicle_plate, seats:4, photo_url:d.vehicle_photo_url||null, status:'active', is_active:true, driver_id:drData?.id||null });
  }
  await completeFlow(lineUserId);
  const body: unknown[] = [
    { type:'box', layout:'baseline', contents:[{ type:'text', text:'บริษัท', color:'#888888', size:'sm', flex:3 }, { type:'text', text:String(d.company_name), color:'#111111', size:'sm', flex:5 }]},
    { type:'box', layout:'baseline', contents:[{ type:'text', text:'เบอร์โทร', color:'#888888', size:'sm', flex:3 }, { type:'text', text:String(d.phone), color:'#111111', size:'sm', flex:5 }]},
    { type:'separator' },
    { type:'text', text:'⏳ Admin จะยืนยันภายใน 24 ชั่วโมง', size:'sm', color:'#555555', wrap:true }
  ];
  await sendLine(lineUserId,[{ type:'flex', altText:'✅ สมัครสำเร็จ!', contents:{ type:'bubble',
    header:{ type:'box', layout:'vertical', backgroundColor:'#1D9E75', paddingAll:'16px', contents:[{ type:'text', text:'✅ ส่งคำขอสมัครแล้ว!', color:'#ffffff', weight:'bold', size:'xl' }]},
    body:{ type:'box', layout:'vertical', spacing:'md', contents:body },
    footer:{ type:'box', layout:'vertical', contents:[
      { type:'button', action:{ type:'postback', label:'➕ เพิ่มรถ (ถ้ามี)', data:`action=add_another_vehicle&uid=${lineUserId}` }, style:'primary', color:'#1D9E75' },
      { type:'button', action:{ type:'postback', label:'✅ ไม่มีรถเพิ่ม', data:`action=done_adding_vehicles&uid=${lineUserId}` }, style:'secondary' }
    ]} } }]);
}

async function handleDriverStep(lineUserId: string, step: string, text: string, data: Record<string, unknown>) {
  if (step==='dr_full_name') {
    await updateFlow(lineUserId,'dr_phone',{ full_name:text });
    await sendText(lineUserId,`✅ ชื่อ: ${text}\n\n📞 เบอร์โทรของคุณ? (เช่น 089-123-4567)`);
  }
  else if (step==='dr_phone') {
    await updateFlow(lineUserId,'dr_license',{ phone:text });
    await sendText(lineUserId,`✅ เบอร์โทร: ${text}\n\n📄 เลขที่ใบขับขี่?`);
  }
  else if (step==='dr_license') {
    await updateFlow(lineUserId,'dr_vehicle_type',{ license_number:text });
    await sendLine(lineUserId, vehicleTypeButtons(lineUserId,'reg_vehicle'));
    await sendText(lineUserId,`✅ เลขใบขับขี่: ${text}\n\nเลือกประเภทรถของคุณ`);
  }
  else if (step==='dr_plate') {
    await updateFlow(lineUserId,'dr_vehicle_photo',{ vehicle_plate:text });
    await sendText(lineUserId,`✅ ทะเบียน: ${text}\n\n📸 ถ่ายรูปภาพรถของคุณ\n(หน้ารถให้เห็นทะเบียนชัดเจน)`);
  }
  else if (step==='dr_vehicle_photo') { await sendText(lineUserId,'📸 กรุณาถ่ายรูปภาพรถ ไม่ใช่ตัวอักษร'); }
  else if (step==='dr_location') {
    const d={...data, base_location:text};
    const { error } = await sb.from('drivers').insert({
      full_name: d.full_name,
      phone: d.phone || null,
      line_user_id: lineUserId,
      license_number: d.license_number,
      vehicle_type: d.vehicle_type,
      vehicle_plate: d.vehicle_plate,
      vehicle_photo_url: d.vehicle_photo_url||null,
      base_location: text,
      home_base_location: text,
      is_verified: false,
      is_active: false,
      is_available: false
    });
    if (error) { await sendText(lineUserId,error.code==='23505'?'⚠️ เคยลงทะเบียนแล้ว':`❌ ${error.message}`); return; }
    await completeFlow(lineUserId);
    const L2=vL();
    await sendLine(lineUserId,[{ type:'flex', altText:'✅ สมัครสำเร็จ!', contents:{ type:'bubble',
      header:{ type:'box', layout:'vertical', backgroundColor:'#1D9E75', paddingAll:'16px', contents:[{ type:'text', text:'✅ ส่งคำขอสมัครแล้ว!', color:'#ffffff', weight:'bold', size:'xl' }]},
      body:{ type:'box', layout:'vertical', spacing:'md', contents:[
        { type:'box', layout:'baseline', contents:[{ type:'text', text:'ชื่อ', color:'#888888', size:'sm', flex:3 }, { type:'text', text:String(d.full_name), color:'#111111', size:'sm', flex:5 }]},
        { type:'box', layout:'baseline', contents:[{ type:'text', text:'เบอร์โทร', color:'#888888', size:'sm', flex:3 }, { type:'text', text:String(d.phone||'-'), color:'#111111', size:'sm', flex:5 }]},
        { type:'box', layout:'baseline', contents:[{ type:'text', text:'ประเภทรถ', color:'#888888', size:'sm', flex:3 }, { type:'text', text:L2[String(d.vehicle_type)]||String(d.vehicle_type), color:'#111111', size:'sm', flex:5 }]},
        { type:'box', layout:'baseline', contents:[{ type:'text', text:'ทะเบียน', color:'#888888', size:'sm', flex:3 }, { type:'text', text:String(d.vehicle_plate||'-'), color:'#111111', size:'sm', flex:5 }]},
        { type:'separator' },
        { type:'text', text:'⏳ Admin จะยืนยันภายใน 24 ชั่วโมง', size:'sm', color:'#555555', wrap:true }
      ]} } }]);
  }
}

function vL(): Record<string,string> {
  return { sedan:'รถเก๋ง', suv:'SUV', van_9:'แวน 9', van_12:'แวน 12', minibus_15:'มินิบัส 15', minibus_20:'มินดิบัส 20', coach_30:'รถโค้ช 30+', pickup:'กระบะ' };
}
