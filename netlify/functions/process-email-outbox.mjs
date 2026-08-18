import nodemailer from "nodemailer";

export const config={schedule:"*/5 * * * *"};
const SUPABASE_URL="https://wvbqmuumzbvaxnaajjqo.supabase.co";

export default async function handler(){
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;const user=process.env.SMTP_USER;const pass=process.env.SMTP_PASSWORD;
 if(!key||!user||!pass)return new Response("Email worker is not configured",{status:503});
 const headers={apikey:key,Authorization:`Bearer ${key}`,"Content-Type":"application/json"};
 const response=await fetch(`${SUPABASE_URL}/rest/v1/email_outbox?status=eq.pending&order=created_at.asc&limit=10`,{headers});
 if(!response.ok)return new Response(await response.text(),{status:500});
 const rows=await response.json();const transport=nodemailer.createTransport({host:process.env.SMTP_HOST||"smtp.hostinger.com",port:Number(process.env.SMTP_PORT||465),secure:Number(process.env.SMTP_PORT||465)===465,auth:{user,pass}});
 let sent=0;
 for(const row of rows){try{await transport.sendMail({from:process.env.EMAIL_FROM||`Estichara.ma <${user}>`,to:row.recipient,subject:row.subject,text:row.body,html:`<div style="font-family:Arial,sans-serif;line-height:1.7;max-width:640px;margin:auto"><h2 style="color:#0D4B4B">Estichara.ma</h2><p>${escapeHtml(row.body).replace(/\n/g,"<br>")}</p><hr style="border:0;border-top:1px solid #eee"><p style="font-size:12px;color:#777">You received this service email because you enabled answer notifications for your question.</p></div>`});await update(row.id,{status:"sent",sent_at:new Date().toISOString(),attempts:row.attempts+1,last_error:""},headers);sent++}catch(error){await update(row.id,{status:row.attempts>=4?"failed":"pending",attempts:row.attempts+1,last_error:String(error?.message||error).slice(0,1000)},headers)}}
 return Response.json({processed:rows.length,sent});
}
function update(id,body,headers){return fetch(`${SUPABASE_URL}/rest/v1/email_outbox?id=eq.${id}`,{method:"PATCH",headers,body:JSON.stringify(body)})}
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]))}
