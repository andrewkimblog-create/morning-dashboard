
import { useState, useEffect } from "react";

const VANGUARD_ETFS = [
  {ticker:"VOO",name:"S&P 500"},{ticker:"VTI",name:"Total Market"},{ticker:"VGT",name:"Info Tech"},
  {ticker:"VHT",name:"Healthcare"},{ticker:"VYM",name:"High Dividend"},{ticker:"VXUS",name:"Intl Stock"},
  {ticker:"VUG",name:"Growth"},{ticker:"VTV",name:"Value"},{ticker:"VWO",name:"Emerging Mkts"},
  {ticker:"VNQ",name:"Real Estate"},{ticker:"VDE",name:"Energy"},{ticker:"VFH",name:"Financials"},
  {ticker:"VAW",name:"Materials"},{ticker:"VIS",name:"Industrials"},{ticker:"VCR",name:"Consumer Disc"},
  {ticker:"VDC",name:"Consumer Staples"},{ticker:"VPU",name:"Utilities"},{ticker:"VOX",name:"Communication"},
  {ticker:"BND",name:"Total Bond"},{ticker:"BNDX",name:"Intl Bond"},
];

const WMO = {
  0:{l:"Clear",i:"☀️"},1:{l:"Mainly Clear",i:"🌤️"},2:{l:"Partly Cloudy",i:"⛅"},
  3:{l:"Overcast",i:"☁️"},45:{l:"Fog",i:"🌫️"},51:{l:"Light Drizzle",i:"🌦️"},
  53:{l:"Drizzle",i:"🌦️"},55:{l:"Heavy Drizzle",i:"🌧️"},61:{l:"Light Rain",i:"🌧️"},
  63:{l:"Rain",i:"🌧️"},65:{l:"Heavy Rain",i:"🌧️"},80:{l:"Showers",i:"🌦️"},95:{l:"Thunderstorm",i:"⛈️"},
};

function rsiColor(r){if(r==null)return"#555";if(r<=30)return"#2ecc71";if(r<=45)return"#00cec9";if(r<=55)return"#c8a96e";if(r<=70)return"#f39c12";return"#e74c3c";}
function rsiLabel(r){if(r==null)return"—";if(r<=30)return"OVERSOLD";if(r<=45)return"CHEAP";if(r<=55)return"NEUTRAL";if(r<=70)return"EXTENDED";return"OVERBOUGHT";}

function Spin(){return<div style={{display:"inline-block",width:14,height:14,border:"2px solid rgba(255,255,255,0.1)",borderTop:"2px solid #c8a96e",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>;}

function Card({title,accent="#c8a96e",loading,children}){
  return(
    <div style={{background:"rgba(12,16,24,0.92)",border:`1px solid ${accent}22`,borderRadius:12,overflow:"hidden",backdropFilter:"blur(16px)"}}>
      <div style={{padding:"10px 15px",borderBottom:`1px solid ${accent}15`,display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:3,height:15,background:accent,borderRadius:2,flexShrink:0}}/>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"0.13em",color:accent,textTransform:"uppercase",fontWeight:600}}>{title}</span>
        {loading&&<span style={{marginLeft:"auto"}}><Spin/></span>}
      </div>
      <div style={{padding:"12px 15px"}}>{children}</div>
    </div>
  );
}

// ── WEATHER ──────────────────────────────────────────────────────────────────
function Weather(){
  const[w,setW]=useState(null);const[loading,setL]=useState(true);
  useEffect(()=>{
    fetch("https://api.open-meteo.com/v1/forecast?latitude=38.9072&longitude=-77.0369&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,precipitation,humidity_2m,uv_index&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,uv_index_max,sunrise,sunset&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=America%2FNew_York&forecast_days=4")
      .then(r=>r.json()).then(setW).catch(()=>setW(null)).finally(()=>setL(false));
  },[]);
  if(loading)return<Card title="Weather · Washington DC" accent="#4a9eff" loading><p style={{color:"#555",fontSize:12}}>Loading...</p></Card>;
  if(!w)return<Card title="Weather · Washington DC" accent="#4a9eff"><p style={{color:"#f66",fontSize:12}}>Unavailable</p></Card>;
  const c=w.current,d=w.daily,wmo=WMO[c.weathercode]||{l:"Unknown",i:"🌡️"};
  const days=["Today","Tomorrow",...d.time.slice(2,4).map(t=>new Date(t+"T00:00:00").toLocaleDateString("en-US",{weekday:"short"}))];
  return(
    <Card title="Weather · Washington DC" accent="#4a9eff">
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12}}>
        <div style={{fontSize:44,lineHeight:1}}>{wmo.i}</div>
        <div>
          <div style={{fontSize:38,fontWeight:700,color:"#fff",lineHeight:1,fontFamily:"'DM Mono',monospace"}}>{Math.round(c.temperature_2m)}°F</div>
          <div style={{color:"#666",fontSize:11,marginTop:2}}>Feels {Math.round(c.apparent_temperature)}°F · {wmo.l}</div>
        </div>
        <div style={{marginLeft:"auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3px 12px"}}>
          {[["💧",`${c.humidity_2m}%`,"Hum"],["💨",`${Math.round(c.windspeed_10m)}mph`,"Wind"],["🌧️",`${c.precipitation}"`,"Precip"],["☀️",`${c.uv_index}`,"UV"]].map(([icon,val,label])=>(
            <div key={label} style={{fontSize:10,color:"#777"}}>{icon} <span style={{color:"#ccc"}}>{val}</span> {label}</div>
          ))}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
        {days.map((day,i)=>{const dw=WMO[d.weathercode[i]]||{i:"🌡️"};return(
          <div key={day} style={{background:i===0?"rgba(74,158,255,0.09)":"rgba(255,255,255,0.03)",borderRadius:7,padding:"7px 5px",textAlign:"center",border:i===0?"1px solid rgba(74,158,255,0.22)":"1px solid rgba(255,255,255,0.05)"}}>
            <div style={{fontSize:9,color:"#555",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:2}}>{day}</div>
            <div style={{fontSize:18,marginBottom:2}}>{dw.i}</div>
            <div style={{fontSize:12,color:"#fff",fontWeight:600}}>{Math.round(d.temperature_2m_max[i])}°</div>
            <div style={{fontSize:9,color:"#555"}}>{Math.round(d.temperature_2m_min[i])}°</div>
            {d.precipitation_sum[i]>0&&<div style={{fontSize:9,color:"#4a9eff",marginTop:2}}>{d.precipitation_sum[i]}"</div>}
          </div>
        );})}
      </div>
      <div style={{display:"flex",gap:12,marginTop:8,fontSize:10,color:"#555"}}>
        <span>🌅 {d.sunrise[0]?.slice(11,16)}</span><span>🌇 {d.sunset[0]?.slice(11,16)}</span>
        <span>UV max {d.uv_index_max[0]}</span><span>Wind max {d.windspeed_10m_max[0]}mph</span>
      </div>
    </Card>
  );
}

// ── O'NEIL MARKET PULSE ───────────────────────────────────────────────────────
const STATUS_CFG={
  "Confirmed Uptrend":{color:"#2ecc71",bg:"rgba(46,204,113,0.08)",border:"rgba(46,204,113,0.25)",icon:"▲"},
  "Uptrend Under Pressure":{color:"#f39c12",bg:"rgba(243,156,18,0.08)",border:"rgba(243,156,18,0.25)",icon:"⚠"},
  "Rally Attempt":{color:"#4a9eff",bg:"rgba(74,158,255,0.08)",border:"rgba(74,158,255,0.25)",icon:"↗"},
  "Market in Correction":{color:"#e74c3c",bg:"rgba(231,76,60,0.08)",border:"rgba(231,76,60,0.25)",icon:"▼"},
};
const ACTION_CLR={"DEPLOY CAPITAL":"#2ecc71","SELECTIVE BUYS":"#00cec9","HOLD / REDUCE":"#f39c12","RAISE CASH":"#e74c3c","STAY IN CASH":"#e74c3c"};

function ONeil(){
  const[data,setData]=useState(null);const[loading,setL]=useState(true);
  useEffect(()=>{
    const today=new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});
    fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        model:"claude-sonnet-4-20250514",max_tokens:1000,
        tools:[{type:"web_search_20250305",name:"web_search"}],
        messages:[{role:"user",content:`Today is ${today}. Search for today's S&P 500 and NASDAQ price, volume, and moving average data. Analyze using William O'Neil's market direction methodology (distribution days, follow-through day status, price/volume action). Return ONLY JSON (no markdown): {"status":"Confirmed Uptrend"|"Uptrend Under Pressure"|"Rally Attempt"|"Market in Correction","statusReason":"1 sentence","distributionDays":{"spx":number,"nasdaq":number},"followThrough":{"occurred":boolean,"dayCount":number|null,"note":"string"},"keyLevels":[{"index":"S&P 500","price":"string","ma50":"string","ma200":"string","above50":boolean,"above200":boolean,"change":"string","changeUp":boolean},{"index":"NASDAQ","price":"string","ma50":"string","ma200":"string","above50":boolean,"above200":boolean,"change":"string","changeUp":boolean}],"volumeNote":"1 sentence","leadingStocks":"1 sentence on growth stock health","action":"DEPLOY CAPITAL"|"SELECTIVE BUYS"|"HOLD / REDUCE"|"RAISE CASH"|"STAY IN CASH"}`}]
      })
    }).then(r=>r.json()).then(d=>{
      const text=d.content?.filter(b=>b.type==="text").map(b=>b.text).join("");
      setData(JSON.parse(text.replace(/```json|```/g,"").trim()));
    }).catch(()=>setData({
      status:"Market in Correction",statusReason:"Live data unavailable — verify on IBD/MarketSmith.",
      distributionDays:{spx:null,nasdaq:null},followThrough:{occurred:false,dayCount:null,note:"Check IBD for current FTD status."},
      keyLevels:[{index:"S&P 500",price:"—",ma50:"—",ma200:"—",above50:false,above200:false,change:"—",changeUp:false},{index:"NASDAQ",price:"—",ma50:"—",ma200:"—",above50:false,above200:false,change:"—",changeUp:false}],
      volumeNote:"Volume data unavailable.",leadingStocks:"Check IBD 50 for leadership health.",action:"HOLD / REDUCE"
    })).finally(()=>setL(false));
  },[]);

  const sc=data?(STATUS_CFG[data.status]||STATUS_CFG["Market in Correction"]):null;
  return(
    <Card title="O'Neil Market Pulse · CANSLIM" accent="#9b59b6" loading={loading}>
      {loading?<p style={{color:"#555",fontSize:12}}>Analyzing market direction...</p>:data&&(
        <div>
          <div style={{background:sc.bg,border:`1px solid ${sc.border}`,borderRadius:8,padding:"9px 12px",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:14}}>{sc.icon}</span>
                <span style={{fontSize:14,fontWeight:700,color:sc.color,fontFamily:"'DM Mono',monospace"}}>{data.status}</span>
              </div>
              <div style={{fontSize:10,color:"#777",marginTop:3}}>{data.statusReason}</div>
            </div>
            <div style={{background:`${ACTION_CLR[data.action]||"#888"}18`,border:`1px solid ${ACTION_CLR[data.action]||"#888"}44`,borderRadius:6,padding:"5px 9px",textAlign:"center",flexShrink:0}}>
              <div style={{fontSize:8,color:"#555",letterSpacing:"0.08em"}}>IBD ACTION</div>
              <div style={{fontSize:10,fontWeight:700,color:ACTION_CLR[data.action]||"#888",fontFamily:"'DM Mono',monospace",marginTop:1}}>{data.action}</div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:9}}>
            {(data.keyLevels||[]).map((idx,i)=>(
              <div key={i} style={{background:"rgba(255,255,255,0.03)",borderRadius:7,padding:"8px 10px",border:"1px solid rgba(255,255,255,0.06)"}}>
                <div style={{fontSize:9,color:"#555",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:3}}>{idx.index}</div>
                <div style={{display:"flex",alignItems:"baseline",gap:7,marginBottom:4}}>
                  <span style={{fontSize:16,fontWeight:700,color:"#fff",fontFamily:"'DM Mono',monospace"}}>{idx.price}</span>
                  <span style={{fontSize:11,color:idx.changeUp?"#2ecc71":"#e74c3c"}}>{idx.changeUp?"▲":"▼"} {idx.change}</span>
                </div>
                <div style={{display:"flex",gap:5}}>
                  {[["50d",idx.ma50,idx.above50],["200d",idx.ma200,idx.above200]].map(([label,val,above])=>(
                    <div key={label} style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:above?"rgba(46,204,113,0.1)":"rgba(231,76,60,0.1)",color:above?"#2ecc71":"#e74c3c",border:`1px solid ${above?"rgba(46,204,113,0.25)":"rgba(231,76,60,0.25)"}`}}>{label}: {val} {above?"↑":"↓"}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:9}}>
            {[
              ["SPX Dist Days",data.distributionDays?.spx,data.distributionDays?.spx>=5?"#e74c3c":data.distributionDays?.spx>=3?"#f39c12":"#2ecc71"],
              ["NDX Dist Days",data.distributionDays?.nasdaq,data.distributionDays?.nasdaq>=5?"#e74c3c":data.distributionDays?.nasdaq>=3?"#f39c12":"#2ecc71"],
              ["FTD",data.followThrough?.occurred?`Day ${data.followThrough.dayCount||"✓"}`:"None",data.followThrough?.occurred?"#2ecc71":"#666"],
            ].map(([label,val,color])=>(
              <div key={label} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:7,padding:"7px 8px",textAlign:"center"}}>
                <div style={{fontSize:8,color:"#555",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:2}}>{label}</div>
                <div style={{fontSize:18,fontWeight:700,color,fontFamily:"'DM Mono',monospace"}}>{val??'—'}</div>
              </div>
            ))}
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:3}}>
            {[["📊 Volume",data.volumeNote],["🏆 Leaders",data.leadingStocks],["📋 FTD Note",data.followThrough?.note]].map(([label,note])=>(
              <div key={label} style={{fontSize:10,color:"#777",display:"flex",gap:6}}>
                <span style={{color:"#444",flexShrink:0}}>{label}:</span><span>{note}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

// ── TRADING SETUPS ────────────────────────────────────────────────────────────
const SETUP_TYPES=["Cup & Handle","Flat Base","Double Bottom","VCP","Breakout","Pullback to 10W","Bull Flag","Other"];
const STATUS_OPTS=["Watching","Near Buy Point","Active Position","Stopped Out"];
const STATUS_CLR={Watching:"#4a9eff","Near Buy Point":"#f39c12","Active Position":"#2ecc71","Stopped Out":"#e74c3c"};
const emptySetup=()=>({id:Date.now(),ticker:"",name:"",setupType:"Cup & Handle",buyPoint:"",currentPrice:"",stopLoss:"",target:"",status:"Watching",notes:"",rs:"",added:new Date().toLocaleDateString()});

function TradingSetups(){
  const[setups,setSetups]=useState([]);
  const[adding,setAdding]=useState(false);
  const[draft,setDraft]=useState(emptySetup());
  const[expanded,setExpanded]=useState(null);

  useEffect(()=>{try{const s=localStorage.getItem("ts_v2");if(s)setSetups(JSON.parse(s));}catch(e){}}, []);
  const save=s=>{setSetups(s);try{localStorage.setItem("ts_v2",JSON.stringify(s));}catch(e){}};
  const add=()=>{if(!draft.ticker)return;save([...setups,{...draft,id:Date.now()}]);setDraft(emptySetup());setAdding(false);};
  const remove=id=>save(setups.filter(s=>s.id!==id));
  const updateStatus=(id,status)=>save(setups.map(s=>s.id===id?{...s,status}:s));
  const rr=s=>{if(!s.buyPoint||!s.stopLoss||!s.target)return null;const risk=parseFloat(s.buyPoint)-parseFloat(s.stopLoss),reward=parseFloat(s.target)-parseFloat(s.buyPoint);if(risk<=0)return null;return(reward/risk).toFixed(1);};

  const Inp=({label,val,onChange,placeholder=""})=>(
    <div style={{display:"flex",flexDirection:"column",gap:2}}>
      <label style={{fontSize:9,color:"#555",letterSpacing:"0.08em",textTransform:"uppercase"}}>{label}</label>
      <input value={val} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:4,padding:"4px 7px",color:"#ddd",fontSize:11,outline:"none",fontFamily:"'DM Mono',monospace"}}/>
    </div>
  );
  const Sel=({label,val,onChange,opts})=>(
    <div style={{display:"flex",flexDirection:"column",gap:2}}>
      <label style={{fontSize:9,color:"#555",letterSpacing:"0.08em",textTransform:"uppercase"}}>{label}</label>
      <select value={val} onChange={e=>onChange(e.target.value)}
        style={{background:"#141920",border:"1px solid rgba(255,255,255,0.09)",borderRadius:4,padding:"4px 7px",color:"#ddd",fontSize:11,outline:"none"}}>
        {opts.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return(
    <Card title="Trading Setups · Watchlist" accent="#fd79a8">
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {setups.length===0&&!adding&&<p style={{color:"#444",fontSize:11,margin:0}}>No setups yet. Track your CANSLIM breakout candidates below.</p>}
        {setups.map(s=>{
          const r=rr(s);const isExp=expanded===s.id;
          return(
            <div key={s.id} style={{background:"rgba(255,255,255,0.03)",borderRadius:8,overflow:"hidden",border:`1px solid ${STATUS_CLR[s.status]||"#333"}22`}}>
              <div style={{display:"flex",alignItems:"center",gap:7,padding:"7px 9px",cursor:"pointer"}} onClick={()=>setExpanded(isExp?null:s.id)}>
                <span style={{fontSize:11,fontWeight:700,color:"#fff",fontFamily:"'DM Mono',monospace",minWidth:48}}>{s.ticker}</span>
                <span style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:`${STATUS_CLR[s.status]||"#666"}18`,color:STATUS_CLR[s.status]||"#aaa",border:`1px solid ${STATUS_CLR[s.status]||"#666"}35`,letterSpacing:"0.06em",fontWeight:700,textTransform:"uppercase"}}>{s.status}</span>
                <span style={{fontSize:10,color:"#555"}}>{s.setupType}</span>
                <div style={{marginLeft:"auto",display:"flex",gap:9,alignItems:"center"}}>
                  {s.buyPoint&&<span style={{fontSize:10,color:"#777"}}>BP <span style={{color:"#ddd",fontFamily:"'DM Mono',monospace"}}>${s.buyPoint}</span></span>}
                  {r&&<span style={{fontSize:9,color:parseFloat(r)>=2?"#2ecc71":"#f39c12"}}>R:R {r}x</span>}
                  {s.rs&&<span style={{fontSize:9,color:"#9b59b6"}}>RS {s.rs}</span>}
                  <span style={{fontSize:10,color:"#444"}}>{isExp?"▲":"▼"}</span>
                </div>
              </div>
              {isExp&&(
                <div style={{padding:"8px 9px",borderTop:"1px solid rgba(255,255,255,0.04)"}}>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:7}}>
                    {[["Buy Point",s.buyPoint],["Stop Loss",s.stopLoss],["Target",s.target],["Current",s.currentPrice]].map(([l,v])=>(
                      <div key={l}><div style={{fontSize:8,color:"#555",marginBottom:1}}>{l}</div><div style={{fontSize:12,color:"#ddd",fontFamily:"'DM Mono',monospace"}}>{v?`$${v}`:"—"}</div></div>
                    ))}
                  </div>
                  {s.notes&&<div style={{fontSize:10,color:"#555",marginBottom:7,fontStyle:"italic",borderLeft:"2px solid rgba(253,121,168,0.3)",paddingLeft:7}}>{s.notes}</div>}
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {STATUS_OPTS.map(opt=>(
                      <button key={opt} onClick={()=>updateStatus(s.id,opt)} style={{fontSize:9,padding:"2px 7px",borderRadius:3,cursor:"pointer",background:s.status===opt?`${STATUS_CLR[opt]||"#666"}18`:"rgba(255,255,255,0.04)",color:s.status===opt?STATUS_CLR[opt]||"#aaa":"#555",border:`1px solid ${s.status===opt?(STATUS_CLR[opt]||"#666")+"44":"rgba(255,255,255,0.07)"}`}}>{opt}</button>
                    ))}
                    <button onClick={()=>remove(s.id)} style={{fontSize:9,padding:"2px 7px",borderRadius:3,cursor:"pointer",background:"rgba(231,76,60,0.08)",color:"#e74c3c",border:"1px solid rgba(231,76,60,0.25)",marginLeft:"auto"}}>Remove</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {adding?(
          <div style={{background:"rgba(253,121,168,0.04)",borderRadius:8,padding:"11px",border:"1px solid rgba(253,121,168,0.15)"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:7}}>
              <Inp label="Ticker" val={draft.ticker} onChange={v=>setDraft({...draft,ticker:v.toUpperCase()})} placeholder="AAPL"/>
              <Inp label="Company" val={draft.name} onChange={v=>setDraft({...draft,name:v})} placeholder="Apple Inc."/>
              <Sel label="Setup Type" val={draft.setupType} onChange={v=>setDraft({...draft,setupType:v})} opts={SETUP_TYPES}/>
              <Sel label="Status" val={draft.status} onChange={v=>setDraft({...draft,status:v})} opts={STATUS_OPTS}/>
              <Inp label="Buy Point $" val={draft.buyPoint} onChange={v=>setDraft({...draft,buyPoint:v})} placeholder="215.50"/>
              <Inp label="Stop Loss $" val={draft.stopLoss} onChange={v=>setDraft({...draft,stopLoss:v})} placeholder="208.00"/>
              <Inp label="Target $" val={draft.target} onChange={v=>setDraft({...draft,target:v})} placeholder="240.00"/>
              <Inp label="Current $" val={draft.currentPrice} onChange={v=>setDraft({...draft,currentPrice:v})} placeholder="210.00"/>
              <Inp label="RS Rating (1-99)" val={draft.rs} onChange={v=>setDraft({...draft,rs:v})} placeholder="87"/>
            </div>
            <div style={{marginBottom:7}}>
              <label style={{fontSize:9,color:"#555",letterSpacing:"0.08em",display:"block",marginBottom:2}}>NOTES / THESIS</label>
              <textarea value={draft.notes} onChange={e=>setDraft({...draft,notes:e.target.value})} placeholder="Chart notes, earnings catalyst, RS rank, industry group..."
                style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:4,padding:"5px 7px",color:"#ccc",fontSize:10,outline:"none",resize:"none",height:44,fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={add} style={{padding:"5px 12px",borderRadius:4,cursor:"pointer",fontSize:10,fontWeight:600,background:"rgba(253,121,168,0.12)",color:"#fd79a8",border:"1px solid rgba(253,121,168,0.35)"}}>Add Setup</button>
              <button onClick={()=>setAdding(false)} style={{padding:"5px 12px",borderRadius:4,cursor:"pointer",fontSize:10,background:"rgba(255,255,255,0.04)",color:"#555",border:"1px solid rgba(255,255,255,0.08)"}}>Cancel</button>
            </div>
          </div>
        ):(
          <button onClick={()=>setAdding(true)} style={{padding:"7px",borderRadius:7,cursor:"pointer",fontSize:10,background:"rgba(253,121,168,0.04)",color:"#fd79a8",border:"1px dashed rgba(253,121,168,0.2)",width:"100%"}}>+ Add Trading Setup</button>
        )}
      </div>
    </Card>
  );
}

// ── VANGUARD ETF RSI RANKER ───────────────────────────────────────────────────
function ETFRanker(){
  const[etfs,setEtfs]=useState([]);const[loading,setL]=useState(true);const[ts,setTs]=useState(null);
  useEffect(()=>{
    const today=new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});
    fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        model:"claude-sonnet-4-20250514",max_tokens:1200,
        tools:[{type:"web_search_20250305",name:"web_search"}],
        messages:[{role:"user",content:`Today is ${today}. Search for the latest 14-day RSI values for these Vanguard ETFs from the most recent trading session: VOO, VTI, VGT, VHT, VYM, VXUS, VUG, VTV, VWO, VNQ, VDE, VFH, VAW, VIS, VCR, VDC, VPU, VOX, BND, BNDX. Return ONLY a JSON array sorted by RSI ascending (lowest first), no markdown: [{"ticker":string,"name":string,"rsi":number,"price":string,"change":string,"changeUp":boolean}]. Include all 20 tickers.`}]
      })
    }).then(r=>r.json()).then(d=>{
      const text=d.content?.filter(b=>b.type==="text").map(b=>b.text).join("");
      const parsed=JSON.parse(text.replace(/```json|```/g,"").trim());
      setEtfs([...parsed].sort((a,b)=>a.rsi-b.rsi));
      setTs(new Date().toLocaleTimeString());
    }).catch(()=>{
      setEtfs(VANGUARD_ETFS.map(e=>({...e,rsi:null,price:"—",change:"—",changeUp:true})));
    }).finally(()=>setL(false));
  },[]);

  return(
    <Card title="Vanguard ETF RSI Ranker · Oversold → Overbought · RSI(14)" accent="#00cec9" loading={loading}>
      {loading?<p style={{color:"#555",fontSize:12}}>Fetching RSI data for 20 ETFs from last session...</p>:(
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:8}}>
            {etfs.map((etf,i)=>{
              const color=rsiColor(etf.rsi),label=rsiLabel(etf.rsi),pct=etf.rsi?Math.min(etf.rsi/100,1):0;
              return(
                <div key={etf.ticker} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 7px",background:etf.rsi<=35?"rgba(46,204,113,0.05)":"rgba(255,255,255,0.02)",borderRadius:6,border:etf.rsi<=35?"1px solid rgba(46,204,113,0.12)":"1px solid rgba(255,255,255,0.04)"}}>
                  <div style={{fontSize:8,fontWeight:700,color:"#444",width:14,textAlign:"right",fontFamily:"'DM Mono',monospace",flexShrink:0}}>{i+1}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                      <span style={{fontSize:11,fontWeight:700,color:"#ddd",fontFamily:"'DM Mono',monospace"}}>{etf.ticker}</span>
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <span style={{fontSize:8,padding:"1px 3px",borderRadius:3,background:`${color}15`,color,border:`1px solid ${color}35`,letterSpacing:"0.04em",fontWeight:700}}>{label}</span>
                        <span style={{fontSize:11,fontWeight:700,color,fontFamily:"'DM Mono',monospace"}}>{etf.rsi??'—'}</span>
                      </div>
                    </div>
                    <div style={{height:3,background:"rgba(255,255,255,0.05)",borderRadius:3,overflow:"hidden",marginBottom:2}}>
                      <div style={{height:"100%",width:`${pct*100}%`,background:color,borderRadius:3,transition:"width 1s ease"}}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <span style={{fontSize:9,color:"#444"}}>{etf.name}</span>
                      <span style={{fontSize:9,color:etf.changeUp?"#2ecc71":"#e74c3c",fontFamily:"'DM Mono',monospace"}}>{etf.price} {etf.changeUp?"▲":"▼"}{etf.change}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6}}>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {[["≤30 OVERSOLD","#2ecc71"],["31–45 CHEAP","#00cec9"],["46–55 NEUTRAL","#c8a96e"],["56–70 EXTENDED","#f39c12"],["70+ OVERBOUGHT","#e74c3c"]].map(([l,c])=>(
                <div key={l} style={{fontSize:8,color:c,display:"flex",alignItems:"center",gap:3}}><div style={{width:5,height:5,borderRadius:"50%",background:c}}/>{l}</div>
              ))}
            </div>
            {ts&&<div style={{fontSize:9,color:"#333"}}>RSI(14) · Last close · {ts}</div>}
          </div>
        </>
      )}
    </Card>
  );
}

// ── TASKS ─────────────────────────────────────────────────────────────────────
function Tasks(){
  const[tasks,setT]=useState([]);const[loading,setL]=useState(true);
  useEffect(()=>{
    const today=new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});
    fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        model:"claude-sonnet-4-20250514",max_tokens:600,
        mcp_servers:[{type:"url",url:"https://gcal.mcp.claude.com/mcp",name:"gcal"}],
        messages:[{role:"user",content:`Get my Google Calendar events for today and next 3 days. Today is ${today}. Return ONLY JSON array (no markdown), max 10 items: [{"title":string,"time":string,"date":"Today"|"Tomorrow"|"Wed" etc,"priority":1-3,"category":"Work"|"Personal"|"Health"|"Finance"|"Goal"}]. Priority 3=urgent/today. Empty array [] if no access.`}]
      })
    }).then(r=>r.json()).then(d=>{
      const text=d.content?.filter(b=>b.type==="text").map(b=>b.text).join("");
      const parsed=JSON.parse(text.replace(/```json|```/g,"").trim());
      setT(parsed.length?parsed:def());
    }).catch(()=>setT(def())).finally(()=>setL(false));
  },[]);
  const def=()=>[
    {title:"RTS Project — weekly progress block",time:"9:00 AM",date:"Today",priority:3,category:"Work"},
    {title:"RX M283 Weekly Call (Dhanesh)",time:"8:00 AM",date:"Tue",priority:3,category:"Work"},
    {title:"Review goal cycle progress",time:"7:00 PM",date:"Today",priority:2,category:"Goal"},
    {title:"Vaccine clinic outreach calls",time:"—",date:"This week",priority:2,category:"Work"},
    {title:"Haircut — David Rios Georgetown",time:"—",date:"This week",priority:1,category:"Personal"},
  ];
  const CAT={Work:"#4a9eff",Personal:"#a29bfe",Health:"#00cec9",Finance:"#c8a96e",Goal:"#fd79a8"};
  return(
    <Card title="Priorities & Calendar" accent="#a29bfe" loading={loading}>
      {loading?<p style={{color:"#555",fontSize:12}}>Pulling calendar...</p>:(
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {[...tasks].sort((a,b)=>b.priority-a.priority).map((t,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:7,padding:"6px 8px",background:t.priority===3?"rgba(74,158,255,0.05)":"rgba(255,255,255,0.02)",borderRadius:5,border:"1px solid rgba(255,255,255,0.04)"}}>
              <div style={{width:5,height:5,borderRadius:"50%",flexShrink:0,background:t.priority===3?"#ff6b35":t.priority===2?"#c8a96e":"#444"}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:"#ccc"}}>{t.title}</div>
                <div style={{fontSize:9,color:"#555",marginTop:1}}>{t.date} · {t.time}</div>
              </div>
              <span style={{fontSize:8,padding:"1px 4px",borderRadius:3,background:`${CAT[t.category]||"#666"}15`,color:CAT[t.category]||"#aaa",border:`1px solid ${CAT[t.category]||"#666"}30`,letterSpacing:"0.06em",fontWeight:700,textTransform:"uppercase"}}>{t.category}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── MARKETS ───────────────────────────────────────────────────────────────────
function Markets(){
  const[data,setData]=useState(null);const[loading,setL]=useState(true);
  useEffect(()=>{
    fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        model:"claude-sonnet-4-20250514",max_tokens:700,
        tools:[{type:"web_search_20250305",name:"web_search"}],
        messages:[{role:"user",content:`Search for today's: S&P 500, NASDAQ, Dow Jones, 10Y Treasury yield, Gold price, Bitcoin price. Return ONLY JSON (no markdown): {"markets":[{"name":string,"value":string,"change":string,"up":boolean}],"headlines":[{"title":string,"source":string,"url":string}]}`}]
      })
    }).then(r=>r.json()).then(d=>{
      const text=d.content?.filter(b=>b.type==="text").map(b=>b.text).join("");
      setData(JSON.parse(text.replace(/```json|```/g,"").trim()));
    }).catch(()=>setData({markets:[{name:"S&P 500",value:"—",change:"—",up:true},{name:"NASDAQ",value:"—",change:"—",up:true},{name:"DOW",value:"—",change:"—",up:true},{name:"10Y Yield",value:"—",change:"—",up:true},{name:"Gold",value:"—",change:"—",up:true},{name:"Bitcoin",value:"—",change:"—",up:true}],headlines:[]})).finally(()=>setL(false));
  },[]);
  return(
    <Card title="Markets & Wealth" accent="#c8a96e" loading={loading}>
      {loading?<p style={{color:"#555",fontSize:12}}>Fetching markets...</p>:(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:9}}>
            {(data?.markets||[]).map((m,i)=>(
              <div key={i} style={{background:"rgba(200,169,110,0.05)",border:"1px solid rgba(200,169,110,0.1)",borderRadius:6,padding:"7px 9px"}}>
                <div style={{fontSize:9,color:"#666",letterSpacing:"0.07em",textTransform:"uppercase"}}>{m.name}</div>
                <div style={{fontSize:14,fontWeight:700,color:"#fff",fontFamily:"'DM Mono',monospace",marginTop:2}}>{m.value}</div>
                <div style={{fontSize:10,color:m.up?"#2ecc71":"#e74c3c",marginTop:1}}>{m.up?"▲":"▼"} {m.change}</div>
              </div>
            ))}
          </div>
          {(data?.headlines||[]).map((h,i)=>(
            <a key={i} href={h.url} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:7,padding:"5px 0",borderTop:"1px solid rgba(255,255,255,0.04)",textDecoration:"none"}}>
              <span style={{fontSize:9,color:"#c8a96e",flexShrink:0}}>{h.source}</span>
              <span style={{fontSize:11,color:"#999"}}>{h.title}</span>
              <span style={{marginLeft:"auto",fontSize:9,color:"#333"}}>↗</span>
            </a>
          ))}
        </>
      )}
    </Card>
  );
}

// ── PHARMACY NEWS ─────────────────────────────────────────────────────────────
function Pharmacy(){
  const[news,setNews]=useState([]);const[loading,setL]=useState(true);
  const TAG_CLR={FDA:"#ff6b35",CDC:"#e74c3c",DC:"#3498db",MD:"#2ecc71",VA:"#9b59b6",Clinical:"#f39c12",Industry:"#1abc9c"};
  useEffect(()=>{
    fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        model:"claude-sonnet-4-20250514",max_tokens:900,
        tools:[{type:"web_search_20250305",name:"web_search"}],
        messages:[{role:"user",content:`Search latest pharmacy/healthcare news past 48 hours: FDA drug approvals/recalls/warnings, CDC health alerts, pharmacy regulation in DC/Maryland/Virginia, drug shortages, ASHP. Return ONLY JSON array (no markdown, 8 items): [{"title":string,"source":string,"url":string,"tag":"FDA"|"CDC"|"DC"|"MD"|"VA"|"Clinical"|"Industry","urgency":1-3}]`}]
      })
    }).then(r=>r.json()).then(d=>{
      const text=d.content?.filter(b=>b.type==="text").map(b=>b.text).join("");
      setNews(JSON.parse(text.replace(/```json|```/g,"").trim()));
    }).catch(()=>setNews([
      {title:"FDA Drug Safety Communications",source:"FDA",url:"https://www.fda.gov/drugs/drug-safety-and-availability/drug-safety-communications",tag:"FDA",urgency:2},
      {title:"CDC Health Alert Network",source:"CDC",url:"https://emergency.cdc.gov/han/",tag:"CDC",urgency:3},
      {title:"DC Board of Pharmacy",source:"DC Board",url:"https://dchealth.dc.gov/page/pharmacy",tag:"DC",urgency:1},
      {title:"Maryland Board of Pharmacy",source:"MD Board",url:"https://health.maryland.gov/bopha/",tag:"MD",urgency:1},
      {title:"Virginia Board of Pharmacy",source:"VA Board",url:"https://www.dhp.virginia.gov/pharmacy/",tag:"VA",urgency:1},
      {title:"ASHP Drug Shortages",source:"ASHP",url:"https://www.ashp.org/drug-shortages",tag:"Clinical",urgency:2},
    ])).finally(()=>setL(false));
  },[]);
  return(
    <Card title="Pharmacy & Regulatory News · FDA · CDC · DC/MD/VA" accent="#ff6b35" loading={loading}>
      {loading?<p style={{color:"#555",fontSize:12}}>Scanning FDA, CDC, DC/MD/VA Boards...</p>:(
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {news.map((item,i)=>(
            <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
              style={{display:"flex",alignItems:"flex-start",gap:7,padding:"6px 8px",background:item.urgency===3?"rgba(231,76,60,0.05)":"rgba(255,255,255,0.02)",borderRadius:5,border:item.urgency===3?"1px solid rgba(231,76,60,0.15)":"1px solid rgba(255,255,255,0.04)",textDecoration:"none"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}
              onMouseLeave={e=>e.currentTarget.style.background=item.urgency===3?"rgba(231,76,60,0.05)":"rgba(255,255,255,0.02)"}>
              {item.urgency===3&&<span style={{fontSize:10,marginTop:1}}>🚨</span>}
              <span style={{fontSize:8,padding:"1px 4px",borderRadius:3,background:`${TAG_CLR[item.tag]||"#666"}15`,color:TAG_CLR[item.tag]||"#aaa",border:`1px solid ${TAG_CLR[item.tag]||"#666"}30`,whiteSpace:"nowrap",flexShrink:0,marginTop:1,letterSpacing:"0.05em",fontWeight:700}}>{item.tag}</span>
              <span style={{fontSize:11,color:"#bbb",lineHeight:1.4}}>{item.title}</span>
              <span style={{marginLeft:"auto",fontSize:9,color:"#333",flexShrink:0}}>↗</span>
            </a>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── GOALS ─────────────────────────────────────────────────────────────────────
function Goals(){
  const[goals,setGoals]=useState([
    {id:1,label:"RTS Project",current:25,target:100,unit:"%",icon:"📊"},
    {id:2,label:"Workouts this week",current:0,target:4,unit:"sessions",icon:"🏋️"},
    {id:3,label:"Writing blocks",current:0,target:5,unit:"hrs",icon:"✍️"},
    {id:4,label:"Vaccine clinic calls",current:0,target:10,unit:"calls",icon:"📞"},
  ]);
  const upd=(id,delta)=>setGoals(gs=>gs.map(g=>g.id===id?{...g,current:Math.min(Math.max(0,g.current+delta),g.target)}:g));
  return(
    <Card title="Goals & Body" accent="#00cec9">
      <div style={{display:"flex",flexDirection:"column",gap:9}}>
        {goals.map(g=>{const pct=Math.min((g.current/g.target)*100,100);return(
          <div key={g.id}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
              <span style={{fontSize:11,color:"#bbb"}}>{g.icon} {g.label}</span>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <button onClick={()=>upd(g.id,-1)} style={{width:16,height:16,borderRadius:3,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.04)",color:"#777",cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>−</button>
                <span style={{fontSize:10,color:"#00cec9",fontFamily:"'DM Mono',monospace",minWidth:38,textAlign:"center"}}>{g.current}/{g.target} {g.unit}</span>
                <button onClick={()=>upd(g.id,1)} style={{width:16,height:16,borderRadius:3,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.04)",color:"#777",cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>+</button>
              </div>
            </div>
            <div style={{height:3,background:"rgba(255,255,255,0.05)",borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct}%`,background:pct>=100?"#2ecc71":pct>60?"#00cec9":"#c8a96e",borderRadius:3,transition:"width 0.5s ease"}}/>
            </div>
          </div>
        );})}
      </div>
      <div style={{marginTop:10,paddingTop:9,borderTop:"1px solid rgba(255,255,255,0.04)"}}>
        {["🏋️ Gold's Dupont — 1101 Connecticut Ave NW","🏋️ Gold's Van Ness — 4310 Connecticut Ave NW","✂️ David Rios — Georgetown (every 3 wks)","👔 SNS Alterations — 1512 U St NW (appt, opens 11AM)"].map((t,i)=>(
          <div key={i} style={{fontSize:9,color:"#383e4a",marginBottom:2}}>→ {t}</div>
        ))}
      </div>
    </Card>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function Dashboard(){
  const[time,setTime]=useState(new Date());
  useEffect(()=>{const id=setInterval(()=>setTime(new Date()),1000);return()=>clearInterval(id);},[]);
  const h=time.getHours();
  const greeting=h<12?"Good morning":h<17?"Good afternoon":"Good evening";
  return(
    <div style={{minHeight:"100vh",background:"#070a10",color:"#fff",fontFamily:"Georgia,serif",padding:"18px 22px",backgroundImage:"radial-gradient(ellipse at 15% 0%,rgba(74,158,255,0.04) 0%,transparent 40%),radial-gradient(ellipse at 85% 100%,rgba(200,169,110,0.03) 0%,transparent 40%)"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&family=Playfair+Display:wght@600;700&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-track{background:#0d1017}
        ::-webkit-scrollbar-thumb{background:#252a38;border-radius:2px}
        select option{background:#141920}
        button:hover{opacity:0.85}
      `}</style>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
        <div>
          <div style={{fontSize:9,color:"#333",letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",marginBottom:3}}>Command Center · Georgia Ave Pharmacy</div>
          <h1 style={{margin:0,fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700,color:"#fff",letterSpacing:"-0.01em"}}>{greeting}, Andrew.</h1>
          <div style={{fontSize:11,color:"#3a4050",marginTop:3}}>{time.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</div>
        </div>
        <div style={{textAlign:"right",fontFamily:"'DM Mono',monospace"}}>
          <div style={{fontSize:24,color:"#c8a96e",fontWeight:500}}>{time.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</div>
          <div style={{fontSize:8,color:"#2a2f3e",letterSpacing:"0.12em",marginTop:2}}>WASHINGTON DC · EST</div>
        </div>
      </div>

      {/* Layout */}
      <div style={{display:"grid",gap:12}}>
        <Weather/>
        <div style={{display:"grid",gridTemplateColumns:"1.15fr 1fr",gap:12}}><ONeil/><Tasks/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><TradingSetups/><Goals/></div>
        <ETFRanker/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1.15fr",gap:12}}><Markets/><Pharmacy/></div>
      </div>

      <div style={{textAlign:"center",marginTop:18,fontSize:8,color:"#1e232e",letterSpacing:"0.1em"}}>
        REFRESHES ON LOAD · MARKET DATA FOR INFORMATIONAL PURPOSES ONLY · NOT FINANCIAL ADVICE
      </div>
    </div>
  );
}
