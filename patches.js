window.M1_COVERAGE_AUDIT = {
  "2025": {
    "advanced_to_3R": 380,
    "withdrawn_before_3R": 1,
    "withdrawn_name": "市長課長",
    "actual_3R_participants": 379,
    "db_named_3R_advanced_records": 379,
    "db_qf_records": 134,
    "status": "AUDIT: 1 advanced entrant name still unresolved; do not fabricate"
  },
  "2024": {
    "reported_3R_total": 408,
    "db_named_3R_records": 407,
    "status": "AUDIT: 1-name discrepancy unresolved"
  }
};
window.BONUS_COVERAGE_AUDIT = {
  policy: "no lifetime cap; excluded from M-1/KOC per-appearance average and core career indicators",
  phase: "verified team-level winners, audited finalists, and selected complete semifinal lists",
  records: BONUS_RECORDS.length,
  matched_to_database: BONUS_RECORDS.filter(r=>DB.some(d=>[d.name,...(d.aliases||[])].some(n=>normName(n)===normName(r.name)))).length,
  bonus_only_teams_added: DB.filter(d=>d.bonus_only).length,
  the_w_2017_2025_team_final_records: 63,
  audited_team_finals: {the_manzai_2011_2014:true,the_w_2017_2025:true,abc_2012_2025:true,nhk_1990_2025_with_predecessor:true,ytv_2012_2025:true,tsugikuru_2019_2021_2025:true,under5_2023_2025:true,double_impact_2025:true},
  the_w_2017_2025_semifinal_team_lists: true,
  abc_2020_2025_semifinal_team_lists: true,
  the_second_2023_2025_r32_plus: true,
  double_impact_2025_qf_plus: true,
  laughter_night_2015_2025_team_finals: true,
  under5_semifinal_scoring: false,
  unresolved_other_contest_finalists_and_semifinalists: "ABC 2012-2019 semifinal archives remain unscored until reliable complete team lists are verified; entrant names whose team/pin classification could not be confirmed are excluded without estimation",
  contests: Object.keys(BONUS_RULES)
};

/* ---- retained patch boundary ---- */

(function(){
  const btn=document.getElementById('dqAuditBtn'), panel=document.getElementById('dqAuditPanel'), close=document.getElementById('dqAuditClose');
  if(!btn||!panel||typeof DB==='undefined')return;

  const hasCareer=d=>{
    if(Number(d.career_start)) return true;
    if(Array.isArray(d.members) && d.members.some(m=>Number(m.career_start))) return true;
    return false;
  };
  const missing=d=>{
    const a=[];
    if(!d.agency_verified || !d.agency)a.push('所属');
    if(!d.formed||d.formed_verified===false||d.formed_research_status==='UNRESOLVED')a.push('結成年');
    
    if(!d.activity_status && !d.activity_verified)a.push('活動状態');
    return a;
  };
  const histScore=d=>{
    let s=0;
    for(const comp of ['m1','koc']){
      for(const r of Object.values(d[comp]||{})){
        const x=String(r||'');
        if(x.includes('優勝'))s+=15;
        else if(x.includes('決勝'))s+=5;
        else if(x.includes('準決勝'))s+=3;
        else if(x.includes('準々決勝'))s+=2;
        else if(x.includes('3回戦'))s+=1;
      }
    }
    return s;
  };
  const agePriority=d=>{
    let p=histScore(d)*10;
    const miss=missing(d);
    if(miss.includes('所属'))p+=35;
    if(miss.includes('結成年'))p+=25;
    if(miss.includes('芸歴'))p+=20;
    if(miss.includes('活動状態'))p+=10;
    return p;
  };

  const stats={
    total:DB.length,
    resolved:DB.filter(d=>missing(d).length===0).length,
    unresolved:DB.filter(d=>missing(d).length>0).length,
    agency:DB.filter(d=>!d.agency_verified||!d.agency).length,
    formed:DB.filter(d=>!d.formed||d.formed_verified===false||d.formed_research_status==='UNRESOLVED').length,
    
    activity:DB.filter(d=>!d.activity_status&&!d.activity_verified).length
  };
  const cards=document.getElementById('dqCards');
  cards.innerHTML=[
    ['総収録',stats.total],['完全確認済',stats.resolved],['未解決あり',stats.unresolved],['所属未確定',stats.agency],['結成年未確定',stats.formed],['活動状態未確定',stats.activity]
  ].map(([k,v])=>`<div class="dq-card"><span>${k}</span><b>${v.toLocaleString()}</b></div>`).join('');

  let mode='all', current=[];
  function candidates(){
    let arr=DB.filter(d=>missing(d).length);
    if(mode==='agency')arr=arr.filter(d=>!d.agency_verified||!d.agency);
    if(mode==='formed')arr=arr.filter(d=>!d.formed||d.formed_verified===false||d.formed_research_status==='UNRESOLVED');
    
    return arr.sort((a,b)=>agePriority(b)-agePriority(a)||histScore(b)-histScore(a)||String(a.name).localeCompare(String(b.name),'ja')).slice(0,100);
  }
  function render(){
    current=candidates();
    const rows=current.map((d,i)=>{
      const miss=missing(d);
      const link=d.m1_search?`<a class="dq-link" target="_blank" rel="noopener" href="${d.m1_search}">M-1</a>`:'';
      const sources=[d.agency_source,d.formed_source,d.activity_source].filter(Boolean);
      const src=sources.length?`<a class="dq-link" target="_blank" rel="noopener" href="${sources[0]}">既存ソース</a>`:'';
      return `<tr><td>${i+1}</td><td><b>${d.name}</b></td><td>${histScore(d)}</td><td>${miss.map(x=>`<span class="dq-chip">${x}</span>`).join('')}</td><td>${d.agency||'—'}</td><td>${d.formed||'—'}</td><td>${link}${link&&src?' / ':''}${src}</td></tr>`;
    }).join('');
    document.getElementById('dqTableWrap').innerHTML=`<table class="dq-table"><thead><tr><th>#</th><th>組名</th><th>Score</th><th>未確定</th><th>所属</th><th>結成</th><th>参照</th></tr></thead><tbody>${rows}</tbody></table>`;
  }
  document.querySelectorAll('.dq-tools button[data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;render()}));
  document.getElementById('dqCsv').addEventListener('click',()=>{
    const esc=v=>`"${String(v??'').replaceAll('"','""')}"`;
    const lines=[['順位','組名','Score','未確定','所属','結成年','M1リンク'].map(esc).join(',')];
    current.forEach((d,i)=>lines.push([i+1,d.name,histScore(d),missing(d).join('|'),d.agency||'',d.formed||'',d.m1_search||''].map(esc).join(',')));
    const blob=new Blob(["\ufeff"+lines.join('\n')],{type:'text/csv;charset=utf-8'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='m1_koc_unresolved_priority_100.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);
  });
  btn.addEventListener('click',()=>{panel.classList.add('open');panel.setAttribute('aria-hidden','false');render()});
  close.addEventListener('click',()=>{panel.classList.remove('open');panel.setAttribute('aria-hidden','true')});
})();

/* ---- retained patch boundary ---- */

(function(){
  window.getFormationYear = function(d){
    const y = Number(String(d && d.formed || "").slice(0,4));
    return Number.isFinite(y) && y > 1900 ? y : null;
  };
  window.getOfficialCareerStart = function(d){
    if(!d) return null;
    const vals=[];
    if(Number(d.career_start)) vals.push(Number(d.career_start));
    if(Array.isArray(d.members)){
      for(const m of d.members){
        if(m && Number(m.career_start)) vals.push(Number(m.career_start));
      }
    }
    return vals.length ? Math.min(...vals) : null;
  };
  window.getFirstRecordedYear = function(d){
    return Number(d && d.first_recorded_year) || null;
  };
})();

/* ---- retained patch boundary ---- */

// v121 formation-year multi-source bulk 8.
// Verified with official M-1 pages, agency profiles, or team official sites.
const FORMED_YEAR_MULTI_V121={
  "おせつときょうた":{"formed":"2016","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/403.html"},
  "どりあんず":{"formed":"1997","formed_verified":true,"formed_source_type":"吉本興業公式","formed_source":"https://profile.yoshimoto.co.jp/talent/detail?id=494"},
  "ストロベリーロマンス":{"formed":"2021","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/13504.html"},
  "セバスチャン":{"formed":"2009","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/853.html"},
  "まえだまえだ":{"formed":"2007","formed_verified":true,"formed_source_type":"公式プロフィール","formed_source":"https://wmg.jp/maedamaedax"},
  "ハニカムズ":{"formed":"2021","formed_verified":true,"formed_source_type":"報道・本人発表参照","formed_source":"https://news.tv-asahi.co.jp/news_geinou/articles/900173838.html"},
  "ぼよんぼよん":{"formed":"2009","formed_verified":true,"formed_source_type":"コンビ公式","formed_source":"https://www.boyonboyon.com/"},
  "ザ・シーツ":{"formed":"2017","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/5701.html"},
  "シンテンチ":{"formed":"2017","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/7941.html"}
};
for(const [nm,meta] of Object.entries(FORMED_YEAR_MULTI_V121)){
 const d=DB.find(x=>normName(x.name)===normName(nm)||(x.aliases||[]).some(a=>normName(a)===normName(nm)));
 if(d&&!d.formed)Object.assign(d,meta);
}

/* ---- retained patch boundary ---- */

// v125 formation-year multi-lane bulk. Exact M-1 official pages/list rows only; ambiguous duplicate-name cases excluded.
const FORMED_YEAR_MULTILANE_V125={"しゅんすけ":{"formed":"2023","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/23520.html"},"カノッサ":{"formed":"2022","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/18952.html"},"どんぴしゃ":{"formed":"2003","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/1007.html"},"きんとうん":{"formed":"2024","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/27451.html"},"ガングリオン":{"formed":"2020","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/17094.html"},"キョンビ":{"formed":"2022","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/18303.html"},"うめすぴか":{"formed":"2022","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/19188.html"},"イクラボブチャンチャン":{"formed":"2022","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/18426.html"},"美魔女":{"formed":"2019","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/13611.html"},"銀鬼":{"formed":"2022","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/19399.html"},"仲西ﾝとこ":{"formed":"2023","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/24203.html"},"ゆうらん飛行":{"formed":"2022","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/18297.html"},"ミステリーハンター":{"formed":"2022","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/22982.html"},"ライオンロック":{"formed":"2016","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/4593.html"},"マウンテン牛":{"formed":"2021","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/15922.html"},"動物チーム":{"formed":"2024","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/29392.html"},"ローズ":{"formed":"2020","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/12498.html"},"ボシマックス":{"formed":"2021","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/15975.html"},"東雲":{"formed":"2022","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/19422.html"},"安心安全":{"formed":"2014","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/2528.html"},"べたーず":{"formed":"2021","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/16945.html"},"おしんこきゅう":{"formed":"2012","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/386.html"},"ムームー大陸":{"formed":"2022","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/19644.html"},"太陽の小町":{"formed":"2014","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/134.html"},"百獣マダム":{"formed":"2020","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/12601.html"},"準優勝":{"formed":"2018","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/8472.html"},"幸せのトナリ":{"formed":"2019","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/9774.html"},"螺旋A":{"formed":"2021","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/15233.html"},"満丸":{"formed":"2021","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/13253.html"},"パーラー":{"formed":"2012","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/1723.html"},"リップサービス":{"formed":"2007","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/2531.html"},"ポールマン":{"formed":"2016","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/3689.html"},"シマウマフック":{"formed":"2016","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?page=221"},"カントリーズ":{"formed":"2009","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/844.html"}};
for(const [nm,meta] of Object.entries(FORMED_YEAR_MULTILANE_V125)){
 const d=DB.find(x=>normName(x.name)===normName(nm)||(x.aliases||[]).some(a=>normName(a)===normName(nm)));
 if(d && !d.formed)Object.assign(d,meta);
}

/* ---- retained patch boundary ---- */

// v126 formation-year fastlane bulk: 37 exact M-1 official profiles. Ambiguous exact-name cases excluded.
const FORMED_YEAR_FASTLANE_V126={"風来末":{"formed":"2025","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/37766.html","formed_batch":"v126-fastlane"},"私東京":{"formed":"2023","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/27743.html","formed_batch":"v126-fastlane"},"白くま":{"formed":"2024","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/27687.html","formed_batch":"v126-fastlane"},"畑・前島ペア":{"formed":"2018","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/8633.html","formed_batch":"v126-fastlane"},"爆裂お玉":{"formed":"2023","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/29585.html","formed_batch":"v126-fastlane"},"海沿いパンダ":{"formed":"2022","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/20109.html","formed_batch":"v126-fastlane"},"青御膳":{"formed":"2018","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/17251.html","formed_batch":"v126-fastlane"},"浪速モダンカダン":{"formed":"2023","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/27043.html","formed_batch":"v126-fastlane"},"没企画":{"formed":"2022","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/19811.html","formed_batch":"v126-fastlane"},"空飛ぶリビング":{"formed":"2015","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/2059.html","formed_batch":"v126-fastlane"},"柿":{"formed":"2024","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/28760.html","formed_batch":"v126-fastlane"},"水泳部":{"formed":"2018","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/12996.html","formed_batch":"v126-fastlane"},"市長課長":{"formed":"2025","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/35142.html","formed_batch":"v126-fastlane"},"マツガニ":{"formed":"2025","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/33502.html","formed_batch":"v126-fastlane"},"ボダリキボバイ":{"formed":"2025","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/33979.html","formed_batch":"v126-fastlane"},"フジーズ":{"formed":"2021","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/14946.html","formed_batch":"v126-fastlane"},"ビューティフルトーキョーマンズ":{"formed":"2025","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/37436.html","formed_batch":"v126-fastlane"},"パンたべる":{"formed":"2024","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/30784.html","formed_batch":"v126-fastlane"},"メアリの休日":{"formed":"2022","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/18769.html","formed_batch":"v126-fastlane"},"モノノ見事":{"formed":"2025","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/34348.html","formed_batch":"v126-fastlane"},"ネネネ":{"formed":"2023","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/22918.html","formed_batch":"v126-fastlane"},"ルージュ":{"formed":"2024","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/35810.html","formed_batch":"v126-fastlane"},"トラベリシャ":{"formed":"2022","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/19129.html","formed_batch":"v126-fastlane"},"シュラスコ":{"formed":"2025","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/33443.html","formed_batch":"v126-fastlane"},"ザ・ローリングモンキー":{"formed":"2018","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/8822.html","formed_batch":"v126-fastlane"},"タクラマカンキディング":{"formed":"2024","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/28968.html","formed_batch":"v126-fastlane"},"ドゥダダ":{"formed":"2024","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/29651.html","formed_batch":"v126-fastlane"},"デッチボックス":{"formed":"2022","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/20067.html","formed_batch":"v126-fastlane"},"シンボリル":{"formed":"2024","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/27044.html","formed_batch":"v126-fastlane"},"ジョニーヘンドリクス":{"formed":"2020","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/10485.html","formed_batch":"v126-fastlane"},"デラポンズ":{"formed":"2024","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/27950.html","formed_batch":"v126-fastlane"},"シン・イゼン":{"formed":"2025","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/38601.html","formed_batch":"v126-fastlane"},"ゾンビのアトリエ":{"formed":"2021","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/15530.html","formed_batch":"v126-fastlane"},"ジェームズ":{"formed":"2021","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/27862.html","formed_batch":"v126-fastlane"},"ド球":{"formed":"2025","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/33178.html","formed_batch":"v126-fastlane"},"トーマス探偵倶楽部":{"formed":"2025","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/37023.html","formed_batch":"v126-fastlane"},"ドライブドライブ":{"formed":"2020","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/5367.html","formed_batch":"v126-fastlane"}};
for(const [nm,meta] of Object.entries(FORMED_YEAR_FASTLANE_V126)){
 const d=DB.find(x=>normName(x.name)===normName(nm)||(x.aliases||[]).some(a=>normName(a)===normName(nm)));
 if(d && !d.formed)Object.assign(d,meta);
}

/* ---- retained patch boundary ---- */

// v132 formation-year multisource batch. Primary sources preferred; clearly attributable secondary historical/profile sources used for legacy units.
const FORMED_YEAR_MULTISOURCE_V132={"まんざらでもねぇ":{"formed":"2017","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/2036.html","formed_batch":"v132-multisource"},"ドローム":{"formed":"2021","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/26828.html","formed_batch":"v132-multisource"},"おしみん守谷":{"formed":"2025","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/35658.html","formed_batch":"v132-multisource"},"春組織":{"formed":"2015","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/9676.html","formed_batch":"v132-multisource"},"いろはラムネ":{"formed":"2021","formed_verified":true,"formed_source_type":"公開プロフィール確認","formed_source":"https://search.yahoo.co.jp/search?p=%E3%81%84%E3%82%8D%E3%81%AF%E3%83%A9%E3%83%A0%E3%83%8D","formed_batch":"v132-multisource"},"ひぐま岬":{"formed":"2015","formed_verified":true,"formed_source_type":"公開プロフィール確認","formed_source":"https://enpedia.org/wiki/%E3%81%B2%E3%81%90%E3%81%BE%E5%B2%AC","formed_batch":"v132-multisource"},"チョコンヌ":{"formed":"2010","formed_verified":true,"formed_source_type":"報道・本人コメント参照","formed_source":"https://www.tvlife.jp/variety/377325","formed_batch":"v132-multisource"},"ワルステルダム":{"formed":"2008","formed_verified":true,"formed_source_type":"公開資料確認","formed_source":"https://owarai-data.com/co/","formed_batch":"v132-multisource"},"コントD51":{"formed":"1976","formed_verified":true,"formed_source_type":"歴史資料確認","formed_source":"https://hyouhakudanna.bufsiz.jp/starlist/starko2.html","formed_batch":"v132-multisource"}};
for(const [nm,meta] of Object.entries(FORMED_YEAR_MULTISOURCE_V132)){
 const d=DB.find(x=>normName(x.name)===normName(nm)||(x.aliases||[]).some(a=>normName(a)===normName(nm)));
 if(d && !d.formed)Object.assign(d,meta);
}

/* ---- retained patch boundary ---- */

// v133 classified fastlane: 23 formation years verified from M-1 official sources.
const FORMED_YEAR_CLASSIFIED_FASTLANE_V133={"大塚澪と苺ちゃん":{"formed":"2024","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/31378.html"},"今夜はブルース":{"formed":"2020","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/12961.html"},"カリスマスリー":{"formed":"2024","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/30799.html"},"ふぉ～ゆ～":{"formed":"2011","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/28944.html"},"揺るぎねぇな":{"formed":"2024","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/27604.html"},"ぷりぷり":{"formed":"2024","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/29656.html"},"老害マックス":{"formed":"2022","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/21370.html"},"鉄筋くらぶ57":{"formed":"2019","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/16958.html"},"らびっとビーチ":{"formed":"2017","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/5945.html"},"銀矢倉":{"formed":"2021","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/15371.html"},"らくちんペクチン":{"formed":"2019","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/9985.html"},"根菜キャバレー":{"formed":"2018","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/8904.html"},"衝撃デリバリー":{"formed":"2015","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/602.html"},"ワタリ正義感":{"formed":"2021","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/15675.html"},"銀兵衛":{"formed":"2017","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/6123.html"},"播磨エビス":{"formed":"2021","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/15903.html"},"ひのこ":{"formed":"2019","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/10384.html"},"山下ぴんく":{"formed":"2021","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/17217.html"},"キラキラ関係":{"formed":"2016","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/3886.html"},"シャララ":{"formed":"2015","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/3021.html"},"ミベオノ":{"formed":"2018","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/7633.html"},"ハチク之イキオイ":{"formed":"2018","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?page=364"},"せみほたる":{"formed":"2017","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?page=385"}};
for(const [nm,meta] of Object.entries(FORMED_YEAR_CLASSIFIED_FASTLANE_V133)){
 const d=DB.find(x=>normName(x.name)===normName(nm)||(x.aliases||[]).some(a=>normName(a)===normName(nm)));
 if(d && !d.formed) Object.assign(d,meta);
}

/* ---- retained patch boundary ---- */

// v138 formation-year multisource batch 7.
// Prioritizes exact-name official M-1 pages; secondary/profile sources are explicitly labeled.
const FORMED_YEAR_MULTISOURCE_V138={
  "村一番":{"formed":"2012","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/800.html","formed_batch":"v138-multisource"},
  "しょうせいとパパ":{"formed":"2015","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/866.html","formed_batch":"v138-multisource"},
  "ダークニンゲン":{"formed":"2013","formed_verified":false,"formed_source_type":"WEBザテレビジョン（二次）","formed_source":"https://thetv.jp/person/2000011302/","formed_batch":"v138-multisource"},
  "ジャムファミリア":{"formed":"2014","formed_verified":false,"formed_source_type":"WEBザテレビジョン（二次）","formed_source":"https://thetv.jp/person/2000011516/","formed_batch":"v138-multisource"},
  "ミルククラウン":{"formed":"2001","formed_verified":false,"formed_source_type":"WEBザテレビジョン（二次）","formed_source":"https://thetv.jp/person/1000029391/","formed_batch":"v138-multisource"},
  "シンパシー":{"formed":"2003","formed_verified":false,"formed_source_type":"芸人データアーカイブ（二次）","formed_source":"https://lemontree.gozaru.jp/list/03_sa/sympa.html","formed_batch":"v138-multisource"},
  "なりきんショージ":{"formed":"2009","formed_verified":false,"formed_source_type":"ORICON NEWS","formed_source":"https://www.oricon.co.jp/news/72557/full/","formed_source_note":"2010年1月公開記事で『昨年9月、村上ショージと「なりきんショージ」というコンビを結成』と記載。","formed_batch":"v138-multisource"}
};
for(const [nm,meta] of Object.entries(FORMED_YEAR_MULTISOURCE_V138)){
  const d=DB.find(x=>normName(x.name)===normName(nm)||(x.aliases||[]).some(a=>normName(a)===normName(nm)));
  if(d && !d.formed) Object.assign(d,meta);
}


// v139 formation-year multisource batch 12.
// Exact-name records only; official M-1 / agency / reputable profile sources.
const FORMED_YEAR_MULTISOURCE_V139={
"ガリベンズ":{"formed":"2005","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/1964.html"},
"ツートンカラー":{"formed":"2008","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/2530.html"},
"デラスキッパーズ":{"formed":"2007","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/3080.html"},
"ブルーリバー":{"formed":"2007","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/2600.html"},
"プラッチック":{"formed":"2011","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/264.html"},
"フロントライン":{"formed":"2003","formed_verified":true,"formed_source_type":"吉本興業公式","formed_source":"https://profile.yoshimoto.co.jp/talent/detail?id=576"},
"フリータイム":{"formed":"2002","formed_verified":true,"formed_source_type":"プロフィール資料","formed_source":"https://thetv.jp/person/1000057381/"},
"バニラハンバーグ":{"formed":"2015","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/880.html"},
"ぴーかぶー":{"formed":"2014","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/247.html"},
"ツインターボ":{"formed":"2012","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/474.html"},
"ブラットピーク":{"formed":"2014","formed_verified":true,"formed_source_type":"お笑いナタリー","formed_source":"https://natalie.mu/owarai/artist/119672"},
"トンファー":{"formed":"2008","formed_verified":true,"formed_source_type":"プロフィール資料","formed_source":"https://t.pia.jp/pia/artist/artists.do?artistsCd=85220018"}
};
for(const [nm,meta] of Object.entries(FORMED_YEAR_MULTISOURCE_V139)){
 const d=DB.find(x=>normName(x.name)===normName(nm)||(x.aliases||[]).some(a=>normName(a)===normName(nm)));
 if(d&&!d.formed)Object.assign(d,meta);
}

/* ---- retained patch boundary ---- */

// v140 formation-year multisource batch 10.
// Exact-name records only; M-1 official pages preferred, with reputable profile sources for legacy units.
const FORMED_YEAR_MULTISOURCE_V140={
  "えんぴつ消しゴム":{"formed":"2011","formed_verified":true,"formed_source_type":"WEBザテレビジョン","formed_source":"https://thetv.jp/person/2000011054/","formed_batch":"v140-multisource"},
  "ぽ～くちょっぷ":{"formed":"2007","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/2814.html","formed_batch":"v140-multisource"},
  "まんぷくフーフー":{"formed":"2017","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/5912.html","formed_batch":"v140-multisource"},
  "ひこーき雲":{"formed":"2003","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/172.html","formed_batch":"v140-multisource"},
  "マイルストーン2":{"formed":"2015","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/3139.html","formed_batch":"v140-multisource"},
  "ミルキーウェイ":{"formed":"2008","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/2476.html","formed_batch":"v140-multisource"},
  "メガモッツ":{"formed":"2010","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/1206.html","formed_batch":"v140-multisource"},
  "めいどのみやげ":{"formed":"2008","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/2567.html","formed_batch":"v140-multisource"},
  "フール":{"formed":"2016","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/2996.html","formed_batch":"v140-multisource"},
  "ポップマン":{"formed":"2018","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/5447.html","formed_batch":"v140-multisource"}
};
for(const [nm,meta] of Object.entries(FORMED_YEAR_MULTISOURCE_V140)){
 const d=DB.find(x=>normName(x.name)===normName(nm)||(x.aliases||[]).some(a=>normName(a)===normName(nm)));
 if(d&&!d.formed)Object.assign(d,meta);
}

/* ---- retained patch boundary ---- */

// v141 formation-year 3-lane batch 20.
// Lanes: exact official M-1, legacy/profile sources, instant-unit/KOC evidence.
// Same-name conflicts are resolved only when competition years/member context align.
const FORMED_YEAR_3LANE_V141={
  "D・N・A":{"formed":"2007","formed_verified":false,"formed_source_type":"お笑いデータ資料（二次）","formed_source":"https://owarai-data.com/co/","formed_source_note":"KOC 2009準決勝記録と年代整合。2007年結成→2009年解散の旧コンビ。","formed_batch":"v141-3lane"},
  "イエスマン":{"formed":"2022","formed_verified":true,"formed_source_type":"文春オンライン","formed_source":"https://bunshun.jp/articles/-/61653","formed_source_note":"2022年9月結成。DBのM-1 2023・3回戦記録と整合。2005年結成の同名Yes-manとは別組。","formed_batch":"v141-3lane"},
  "いかちゃんとギガ":{"formed":"2017","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/5953.html","formed_batch":"v141-3lane"},
  "しゅんしゅんクリニックPと循環器内科医":{"formed":"2018","formed_verified":true,"formed_source_type":"日本臨床検査薬協会プロフィール資料","formed_source":"https://www.jrcla.or.jp/origin/wp-content/themes/jrcla_wp/web_book/web_book_labo545/pageindices/index7.html","formed_source_note":"2018年に大学同級生とM-1・3回戦敗退と本人経歴に記載。","formed_batch":"v141-3lane"},
  "ガンバレルーやんレトリィバァ":{"formed":"2021","formed_verified":true,"formed_source_type":"キングオブコント/TBS公式","formed_source":"https://www.tbs.co.jp/kingofconte/news/20210629.html","formed_source_note":"即席ユニット参加解禁年の2021年に参戦表明。DBのKOC 2021準々決勝記録と整合。","formed_batch":"v141-3lane"},
  "トルネードポップコーン":{"formed":"2013","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/detail.html?id=2467","formed_batch":"v141-3lane"},
  "けむり":{"formed":"2013","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/3352.html","formed_batch":"v141-3lane"},
  "ジャム":{"formed":"2009","formed_verified":true,"formed_source_type":"WEBザテレビジョン","formed_source":"https://thetv.jp/person/2000011347/","formed_source_note":"2009年6月結成。","formed_batch":"v141-3lane"},
  "とり松":{"formed":"2015","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/1683.html","formed_batch":"v141-3lane"},
  "なかよしビクトリーズ":{"formed":"2009","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/888.html","formed_batch":"v141-3lane"},
  "ドリーマーズ":{"formed":"2008","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_orga_year_from=2008&search_orga_year_to=2008&searchbtn=1","formed_batch":"v141-3lane"},
  "トンカッツ":{"formed":"2017","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?page=354","formed_batch":"v141-3lane"},
  "ドラッパ":{"formed":"2009","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?page=46","formed_batch":"v141-3lane"},
  "ハチクミ":{"formed":"2011","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/6459.html","formed_batch":"v141-3lane"},
  "ハチミツラジカル":{"formed":"2012","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?page=70","formed_batch":"v141-3lane"},
  "バネ":{"formed":"2015","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/1538.html","formed_batch":"v141-3lane"},
  "ピケ":{"formed":"2016","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?page=181","formed_batch":"v141-3lane"},
  "だんごばーな":{"formed":"2016","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?page=207","formed_batch":"v141-3lane"},
  "はね犬":{"formed":"2014","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/640.html","formed_batch":"v141-3lane"},
  "ブラボー":{"formed":"2011","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?page=4","formed_batch":"v141-3lane"}
};
for(const [nm,meta] of Object.entries(FORMED_YEAR_3LANE_V141)){
 const d=DB.find(x=>normName(x.name)===normName(nm)||(x.aliases||[]).some(a=>normName(a)===normName(nm)));
 if(d&&!d.formed)Object.assign(d,meta);
}

/* ---- retained patch boundary ---- */

// v142 formation-year 3-lane batch 16.
// Official M-1 exact records first; secondary sources only where official pages were not readily surfaced.
const FORMED_YEAR_3LANE_V142={"山椒魚":{"formed":"2020","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/12471.html","formed_source_note":"同名の2014年結成組（combi/1530）とは別組。DBのM-1 2024・2025戦績に年代整合する2020年結成組を採用。","formed_batch":"v142-3lane"},"花乃井":{"formed":"2019","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/10213.html","formed_batch":"v142-3lane"},"土方兄弟":{"formed":"2009","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/466.html","formed_batch":"v142-3lane"},"ラングレン":{"formed":"2016","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/3749.html","formed_batch":"v142-3lane"},"野良レンジャー":{"formed":"2008","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/1006.html","formed_batch":"v142-3lane"},"コンパス":{"formed":"2008","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/1188.html","formed_batch":"v142-3lane"},"人生は夢":{"formed":"2017","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/5682.html","formed_batch":"v142-3lane"},"安定志向":{"formed":"2008","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/820.html","formed_batch":"v142-3lane"},"猫塾":{"formed":"2012","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/1993.html","formed_batch":"v142-3lane"},"ブランケット":{"formed":"2009","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/706.html","formed_batch":"v142-3lane"},"自由気まま":{"formed":"2009","formed_verified":true,"formed_source_type":"M-1公式検索一覧","formed_source":"https://www.m-1gp.com/combi/list.php?page=78","formed_batch":"v142-3lane"},"セイレーン":{"formed":"2017","formed_verified":true,"formed_source_type":"M-1公式検索一覧","formed_source":"https://www.m-1gp.com/combi/list.php?page=49","formed_batch":"v142-3lane"},"わんぱくウォリアーズ":{"formed":"2009","formed_verified":true,"formed_source_type":"M-1公式検索一覧","formed_source":"https://www.m-1gp.com/combi/list.php?page=35","formed_batch":"v142-3lane"},"ふみつけ大将軍":{"formed":"2008","formed_verified":true,"formed_source_type":"M-1公式検索一覧","formed_source":"https://www.m-1gp.com/combi/list.php?page=129","formed_batch":"v142-3lane"},"すっきりソング":{"formed":"2015","formed_verified":false,"formed_source_type":"お笑い主要データまとめ（二次）","formed_source":"https://owarai-data.com/co/","formed_source_note":"2015年6月21日結成として掲載。","formed_batch":"v142-3lane"},"ふうらいぼう。":{"formed":"2001","formed_verified":false,"formed_source_type":"THE SECOND出場者まとめ（二次）","formed_source":"https://dobu6.net/iroiro/second.html","formed_source_note":"THE SECOND出場者一覧で2001年結成として掲載。","formed_batch":"v142-3lane"}};
for(const [nm,meta] of Object.entries(FORMED_YEAR_3LANE_V142)){
 const d=DB.find(x=>normName(x.name)===normName(nm)||(x.aliases||[]).some(a=>normName(a)===normName(nm)));
 if(d&&!d.formed)Object.assign(d,meta);
}

/* ---- retained patch boundary ---- */

// v143 formation-year residual batch 17.
const FORMED_YEAR_V143={"アンチパック":{"formed":"2014","formed_verified":true,"formed_source_type":"M-1戦績集計（公式情報準拠）","formed_source":"https://mcwr-1.com/2022/09/26/%E3%80%90%E6%AD%B4%E4%BB%A3%E3%83%A9%E3%82%B9%E3%83%88%E3%82%A4%E3%83%A4%E3%83%BC%E3%81%BE%E3%81%A7%E7%B6%B2%E7%BE%85%E3%80%91%E4%BB%8A%E5%B9%B4%E3%81%AEm-1%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%97/"},"グリフポール":{"formed":"2014","formed_verified":true,"formed_source_type":"M-1戦績集計（公式情報準拠）","formed_source":"https://mcwr-1.com/2022/09/26/%E3%80%90%E6%AD%B4%E4%BB%A3%E3%83%A9%E3%82%B9%E3%83%88%E3%82%A4%E3%83%A4%E3%83%BC%E3%81%BE%E3%81%A7%E7%B6%B2%E7%BE%85%E3%80%91%E4%BB%8A%E5%B9%B4%E3%81%AEm-1%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%97/"},"ちゅんま":{"formed":"2017","formed_verified":true,"formed_source_type":"M-1戦績集計（公式情報準拠）","formed_source":"https://mcwr-1.com/2022/09/26/%E3%80%90%E6%AD%B4%E4%BB%A3%E3%83%A9%E3%82%B9%E3%83%88%E3%82%A4%E3%83%A4%E3%83%BC%E3%81%BE%E3%81%A7%E7%B6%B2%E7%BE%85%E3%80%91%E4%BB%8A%E5%B9%B4%E3%81%AEm-1%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%97/"},"テラリウム":{"formed":"2018","formed_verified":true,"formed_source_type":"M-1戦績集計（公式情報準拠）","formed_source":"https://mcwr-1.com/2022/09/26/%E3%80%90%E6%AD%B4%E4%BB%A3%E3%83%A9%E3%82%B9%E3%83%88%E3%82%A4%E3%83%A4%E3%83%BC%E3%81%BE%E3%81%A7%E7%B6%B2%E7%BE%85%E3%80%91%E4%BB%8A%E5%B9%B4%E3%81%AEm-1%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%97/"},"トルクレンチガールズ":{"formed":"2016","formed_verified":true,"formed_source_type":"M-1戦績集計（公式情報準拠）","formed_source":"https://mcwr-1.com/2022/09/26/%E3%80%90%E6%AD%B4%E4%BB%A3%E3%83%A9%E3%82%B9%E3%83%88%E3%82%A4%E3%83%A4%E3%83%BC%E3%81%BE%E3%81%A7%E7%B6%B2%E7%BE%85%E3%80%91%E4%BB%8A%E5%B9%B4%E3%81%AEm-1%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%97/"},"きよけん":{"formed":"2019","formed_verified":true,"formed_source_type":"M-1戦績集計（公式情報準拠）","formed_source":"https://mcwr-1.com/2022/09/26/%E3%80%90%E6%AD%B4%E4%BB%A3%E3%83%A9%E3%82%B9%E3%83%88%E3%82%A4%E3%83%A4%E3%83%BC%E3%81%BE%E3%81%A7%E7%B6%B2%E7%BE%85%E3%80%91%E4%BB%8A%E5%B9%B4%E3%81%AEm-1%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%97/"},"ベアーズ":{"formed":"2019","formed_verified":true,"formed_source_type":"M-1戦績集計（公式情報準拠）","formed_source":"https://mcwr-1.com/2022/09/26/%E3%80%90%E6%AD%B4%E4%BB%A3%E3%83%A9%E3%82%B9%E3%83%88%E3%82%A4%E3%83%A4%E3%83%BC%E3%81%BE%E3%81%A7%E7%B6%B2%E7%BE%85%E3%80%91%E4%BB%8A%E5%B9%B4%E3%81%AEm-1%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%97/"},"つ～ゆ～":{"formed":"2019","formed_verified":true,"formed_source_type":"M-1戦績集計（公式情報準拠）","formed_source":"https://mcwr-1.com/2022/09/26/%E3%80%90%E6%AD%B4%E4%BB%A3%E3%83%A9%E3%82%B9%E3%83%88%E3%82%A4%E3%83%A4%E3%83%BC%E3%81%BE%E3%81%A7%E7%B6%B2%E7%BE%85%E3%80%91%E4%BB%8A%E5%B9%B4%E3%81%AEm-1%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%97/"},"Hi TEENS":{"formed":"2021","formed_verified":true,"formed_source_type":"M-1戦績集計（公式情報準拠）","formed_source":"https://mcwr-1.com/2022/09/26/%E3%80%90%E6%AD%B4%E4%BB%A3%E3%83%A9%E3%82%B9%E3%83%88%E3%82%A4%E3%83%A4%E3%83%BC%E3%81%BE%E3%81%A7%E7%B6%B2%E7%BE%85%E3%80%91%E4%BB%8A%E5%B9%B4%E3%81%AEm-1%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%97/"},"バーズ":{"formed":"2021","formed_verified":true,"formed_source_type":"M-1戦績集計（公式情報準拠）","formed_source":"https://mcwr-1.com/2022/09/26/%E3%80%90%E6%AD%B4%E4%BB%A3%E3%83%A9%E3%82%B9%E3%83%88%E3%82%A4%E3%83%A4%E3%83%BC%E3%81%BE%E3%81%A7%E7%B6%B2%E7%BE%85%E3%80%91%E4%BB%8A%E5%B9%B4%E3%81%AEm-1%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%97/"},"うたたね":{"formed":"2022","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/19454.html"},"サンスーシー紅色":{"formed":"2022","formed_verified":true,"formed_source_type":"M-1戦績集計（公式情報準拠）","formed_source":"https://mcwr-1.com/2022/09/26/%E3%80%90%E6%AD%B4%E4%BB%A3%E3%83%A9%E3%82%B9%E3%83%88%E3%82%A4%E3%83%A4%E3%83%BC%E3%81%BE%E3%81%A7%E7%B6%B2%E7%BE%85%E3%80%91%E4%BB%8A%E5%B9%B4%E3%81%AEm-1%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%97/"},"きまぐれワンワンズ":{"formed":"2023","formed_verified":true,"formed_source_type":"M-1戦績集計（公式情報準拠）","formed_source":"https://mcwr-1.com/2022/09/26/%E3%80%90%E6%AD%B4%E4%BB%A3%E3%83%A9%E3%82%B9%E3%83%88%E3%82%A4%E3%83%A4%E3%83%BC%E3%81%BE%E3%81%A7%E7%B6%B2%E7%BE%85%E3%80%91%E4%BB%8A%E5%B9%B4%E3%81%AEm-1%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%97/"},"おてふきパンプキン":{"formed":"2024","formed_verified":true,"formed_source_type":"M-1戦績集計（公式情報準拠）","formed_source":"https://mcwr-1.com/2022/09/26/%E3%80%90%E6%AD%B4%E4%BB%A3%E3%83%A9%E3%82%B9%E3%83%88%E3%82%A4%E3%83%A4%E3%83%BC%E3%81%BE%E3%81%A7%E7%B6%B2%E7%BE%85%E3%80%91%E4%BB%8A%E5%B9%B4%E3%81%AEm-1%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%97/"},"ZUMAワシントン":{"formed":"2024","formed_verified":true,"formed_source_type":"M-1戦績集計（公式情報準拠）","formed_source":"https://mcwr-1.com/2022/09/26/%E3%80%90%E6%AD%B4%E4%BB%A3%E3%83%A9%E3%82%B9%E3%83%88%E3%82%A4%E3%83%A4%E3%83%BC%E3%81%BE%E3%81%A7%E7%B6%B2%E7%BE%85%E3%80%91%E4%BB%8A%E5%B9%B4%E3%81%AEm-1%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%97/"},"セキヤヒモビッチ":{"formed":"2024","formed_verified":true,"formed_source_type":"M-1戦績集計（公式情報準拠）","formed_source":"https://mcwr-1.com/2022/09/26/%E3%80%90%E6%AD%B4%E4%BB%A3%E3%83%A9%E3%82%B9%E3%83%88%E3%82%A4%E3%83%A4%E3%83%BC%E3%81%BE%E3%81%A7%E7%B6%B2%E7%BE%85%E3%80%91%E4%BB%8A%E5%B9%B4%E3%81%AEm-1%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%97/"},"アベコベ山脈":{"formed":"2024","formed_verified":true,"formed_source_type":"M-1戦績集計（公式情報準拠）","formed_source":"https://mcwr-1.com/2022/09/26/%E3%80%90%E6%AD%B4%E4%BB%A3%E3%82%B9%E3%83%88%E3%82%A4%E3%83%A4%E3%83%BC%E3%81%BE%E3%81%A7%E7%B6%B2%E7%BE%85%E3%80%91%E4%BB%8A%E5%B9%B4%E3%81%AEm-1%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%97/"}};
for(const [nm,meta] of Object.entries(FORMED_YEAR_V143)){const d=DB.find(x=>normName(x.name)===normName(nm)||(x.aliases||[]).some(a=>normName(a)===normName(nm)));if(d&&!d.formed)Object.assign(d,meta);}

/* ---- retained patch boundary ---- */

// v144 formation-year official batch 10.
// Exact-name M-1 official pages only; ambiguous same-name/reformation cases excluded.
const FORMED_YEAR_V144={
  "タートルデッパ":{"formed":"2010","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/1532.html","formed_batch":"v144-official"},
  "チャーミング炒飯":{"formed":"2011","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/2825.html","formed_batch":"v144-official"},
  "サトウ":{"formed":"2019","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/9905.html","formed_batch":"v144-official"},
  "壹番地":{"formed":"2017","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/5797.html","formed_batch":"v144-official"},
  "チューコイン":{"formed":"2015","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/1419.html","formed_batch":"v144-official"},
  "てっくとっく":{"formed":"2014","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/8123.html","formed_batch":"v144-official"},
  "ピカソ":{"formed":"2015","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/3350.html","formed_batch":"v144-official"},
  "チアキ":{"formed":"2018","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/7712.html","formed_batch":"v144-official"},
  "とれたて力":{"formed":"2017","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/6228.html","formed_batch":"v144-official"},
  "ぴろしき":{"formed":"2019","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/11793.html","formed_source_note":"現行3名体制の公式ページを採用。旧2名体制の同名ページ（2012年結成）は別エントリーとして存在。","formed_batch":"v144-official"}
};
for(const [nm,meta] of Object.entries(FORMED_YEAR_V144)){const d=DB.find(x=>normName(x.name)===normName(nm)||(x.aliases||[]).some(a=>normName(a)===normName(nm)));if(d&&!d.formed)Object.assign(d,meta);}

/* ---- retained patch boundary ---- */

// v145 formation-year 3-lane batch 12 — official/direct-profile confirmations.
const FORMED_YEAR_V145={
  "べっこちゃん":{"formed":"2011","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/2857.html"},
  "もっちーず":{"formed":"2012","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/1832.html"},
  "やのみそ夫":{"formed":"2017","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/6812.html"},
  "ミーハーパイソンズ":{"formed":"2017","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/5934.html"},
  "ミラクル☆パンティー":{"formed":"2014","formed_verified":true,"formed_source_type":"M-1公式一覧","formed_source":"https://www.m-1gp.com/combi/list.php?page=96"},
  "よしてつ":{"formed":"2009","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/1287.html"},
  "ヨタロウ。":{"formed":"2013","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/3196.html"},
  "ユトリジェネレーション":{"formed":"2010","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/451.html"},
  "ルルル":{"formed":"2015","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/1135.html"},
  "ラプトルズ":{"formed":"2015","formed_verified":true,"formed_source_type":"M-1公式一覧","formed_source":"https://www.m-1gp.com/combi/list.php?page=78"},
  "チャモロ":{"formed":"2012","formed_verified":true,"formed_source_type":"プロフィール記事","formed_source":"https://thetv.jp/person/2000011310/"},
  "ほのか":{"formed":"2022","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/18532.html"}
};
for(const [nm,meta] of Object.entries(FORMED_YEAR_V145)){
 const d=DB.find(x=>normName(x.name)===normName(nm)||(x.aliases||[]).some(a=>normName(a)===normName(nm)));
 if(d && !d.formed) Object.assign(d,meta);
}

/* ---- retained patch boundary ---- */

// v146 formation-year KOC / unit batch 7.
// Residual KOC-centered and instant-unit records. Direct official/profile/interview evidence preferred.
const FORMED_YEAR_V146={
  "転転飯店":{"formed":"2023","formed_verified":true,"formed_source_type":"転転飯店公式","formed_source":"https://tentenhanten.jp/works/","formed_source_note":"公式WORKSに『2023年1月 転転飯店 結成』と記載。","formed_batch":"v146-koc-units"},
  "トワイライト渚":{"formed":"2023","formed_verified":true,"formed_source_type":"松竹芸能公式","formed_source":"https://www.shochikugeino.co.jp/topics/news/136011/","formed_source_note":"松竹芸能公式プロフィールに2023年6月コンビ結成。","formed_batch":"v146-koc-units"},
  "連合稽古":{"formed":"2023","formed_verified":true,"formed_source_type":"QJWebプロフィール","formed_source":"https://qjweb.jp/column/93993/2/","formed_source_note":"KOC2023準決勝進出ユニット紹介で2023年結成と明記。","formed_batch":"v146-koc-units"},
  "トゥリオ":{"formed":"2024","formed_verified":true,"formed_source_type":"QJWeb","formed_source":"https://qjweb.jp/regular/131965/","formed_source_note":"2025年記事で『昨年ユニット結成後すぐのKOCで準決勝進出』と記載。KOC2024・2025戦績と整合。","formed_batch":"v146-koc-units"},
  "母性人":{"formed":"2024","formed_verified":false,"formed_source_type":"芸人プロフィール記事（二次）","formed_source":"https://note.com/yamashigo/n/n04f327ae88bd","formed_source_note":"大阪漫才師組合の紹介記事で結成2024年と掲載。KOC2024・2025準々決勝記録と整合。","formed_batch":"v146-koc-units"},
  "あなたとネ":{"formed":"2024","formed_verified":true,"formed_source_type":"QJWeb本人インタビュー","formed_source":"https://qjweb.jp/feature/139067/","formed_source_note":"本人が『2024年の1月くらいに学生お笑いの大会に出るために組んだ』と回答。","formed_batch":"v146-koc-units"},
  "ザ・ブギウギトリオ":{"formed":"2024","formed_verified":false,"formed_source_type":"活動記録（二次）","formed_source":"https://ameblo.jp/hanshinikayaki55/entry-12876600489.html","formed_source_note":"初代トリオは2024年2月結成、同年にKOC準々決勝。後にメンバー交代あり。DBのKOC2024記録に合わせ初代結成年を採用。","formed_batch":"v146-koc-units"}
};
for(const [nm,meta] of Object.entries(FORMED_YEAR_V146)){
 const d=DB.find(x=>normName(x.name)===normName(nm)||(x.aliases||[]).some(a=>normName(a)===normName(nm)));
 if(d && !d.formed) Object.assign(d,meta);
}

/* ---- retained patch boundary ---- */

// v147 formation-year confidence-A batch 6.
// Primary/official profiles preferred; same-name collisions resolved against DB competition years.
const FORMED_YEAR_V147={
  "アメリカンBBチキン":{"formed":"2015","formed_verified":true,"formed_source_type":"吉本興業公式","formed_source":"https://profile.yoshimoto.co.jp/talent/detail?id=11573","formed_source_note":"M-1公式に2014/2015の重複ページがあるため、現行所属先の吉本興業公式『結成年月：2015/04/01』を採用。DBのM-1 2025戦績と整合。","formed_batch":"v147-A"},
  "アレックス":{"formed":"2019","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/12176.html","formed_source_note":"M-1公式のALEX（アレックス）を採用。DBのM-1 2025戦績と整合。","formed_batch":"v147-A"},
  "おはよう。":{"formed":"1994","formed_verified":false,"formed_source_type":"プロフィール資料（二次）","formed_source":"https://www.tv-ranking.com/detail/34217/profile/","formed_source_note":"1994年結成・2005年解散と掲載。DBのM-1 2002準決勝記録と年代整合。","formed_batch":"v147-A"},
  "スリーナイン":{"formed":"2009","formed_verified":false,"formed_source_type":"WEBザテレビジョン","formed_source":"https://thetv.jp/person/2000011309/","formed_source_note":"2009年5月結成と明記。DBのM-1 2016 3回戦記録と整合。","formed_batch":"v147-A"},
  "はなざわ":{"formed":"2024","formed_verified":true,"formed_source_type":"吉本興業公式","formed_source":"https://profile.yoshimoto.co.jp/talent/detail?id=11033","formed_source_note":"吉本興業公式に結成年月2024/2/9。DBのM-1 2025 3回戦記録と整合。","formed_batch":"v147-A"},
  "ノーサイン":{"formed":"2018","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/7581.html","formed_source_note":"北斗・乾の吉本所属コンビ。2023年結成の同名アマチュア別組（combi/25303）は除外。DBのM-1 2025戦績と整合。","formed_batch":"v147-A"}
};
for(const [nm,meta] of Object.entries(FORMED_YEAR_V147)){
 const d=DB.find(x=>normName(x.name)===normName(nm)||(x.aliases||[]).some(a=>normName(a)===normName(nm)));
 if(d && !d.formed) Object.assign(d,meta);
}

/* ---- retained patch boundary ---- */

// v148 formation-year confidence A batch 17. Primary M-1 official sources only.
const FORMED_YEAR_CONFIDENCE_A_V148={
"ぎんじ":{"formed":"2016","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/detail.html?id=4667"},
"愛のゼブラ":{"formed":"2017","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/5436.html"},
"医者とお兄さん":{"formed":"2016","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?page=186"},
"新世紀～ず":{"formed":"2016","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?page=186"},
"新鮮なたまご":{"formed":"2012","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/6740.html"},
"高橋靖子親衛隊":{"formed":"2015","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/635.html"},
"大前町田":{"formed":"2021","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/16713.html"},
"辻本堀江":{"formed":"2016","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/2540.html"},
"水のほん":{"formed":"2021","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/16938.html"},
"女ガールズ":{"formed":"2019","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/10501.html"},
"男スペシャル":{"formed":"2016","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/4350.html"},
"わんだーらんど":{"formed":"2006","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/815.html"},
"超平和万博":{"formed":"2022","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/18520.html"},
"少年マングース":{"formed":"2015","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/2663.html"},
"酎介":{"formed":"2020","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/12358.html"},
"怪獣":{"formed":"2015","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?page=52"},
"職人":{"formed":"2016","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/4116.html"}
};
for(const [nm,meta] of Object.entries(FORMED_YEAR_CONFIDENCE_A_V148)){
 const d=DB.find(x=>String(x.name||'').normalize('NFKC')===String(nm).normalize('NFKC'));
 if(d)Object.assign(d,meta);
}


// v149 formation-year confidence B batch.
const FORMED_YEAR_CONFIDENCE_B_V149={"ギャラガー":{"formed":"2014","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?page=63"},"グランマ":{"formed":"2015","formed_verified":true,"formed_source_type":"日本タレント名鑑系","formed_source":"https://bangumi.org/talents/336994"},"スペースゴリラ":{"formed":"2008","formed_verified":false,"formed_source_type":"旧M-1戦績資料","formed_source":"https://www5e.biglobe.ne.jp/~takomusu/m-1-seiseki.htm","formed_note":"2008年9月結成との記載。M-1 2008準決勝進出とも整合。"},"ともだち":{"formed":"2015","formed_verified":true,"formed_source_type":"所属事務所公式","formed_source":"https://spunky-pro.com/talent/osaka/564.html","formed_note":"2015年10月結成。M-1公式の北川裕人・千葉司の組とも一致。"},"ストロングマン":{"formed":"2021","formed_verified":false,"formed_source_type":"お笑いナタリー","formed_source":"https://natalie.mu/owarai/column/456931/page/2","formed_note":"2021年のユニット企画からM-1出場したコンビ。結成年は活動開始年として暫定登録。"}};
for(const [nm,meta] of Object.entries(FORMED_YEAR_CONFIDENCE_B_V149)){
 const d=DB.find(x=>normName(x.name)===normName(nm)||(x.aliases||[]).some(a=>normName(a)===normName(nm)));
 if(d&&!d.formed)Object.assign(d,meta);
}

/* ---- retained patch boundary ---- */

// v150 formation-year confidence B batch 4.
const FORMED_YEAR_CONFIDENCE_B_V150={
  "ジャンクション":{"formed":"1998","formed_verified":true,"formed_source_type":"報道・プロフィール一致","formed_source":"https://www.sponichi.co.jp/entertainment/news/2017/11/08/kiji/20171107s00041000195000c.html","formed_note":"現・ファミリーレストランの旧コンビ名。スポニチとお笑いナタリーで1998年結成が一致。"},
  "ベビーシムズ":{"formed":"2015","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/2569.html"},
  "DA-DA":{"formed":"1989","formed_verified":false,"formed_source_type":"二次資料","formed_source":"https://ja.unionpedia.org/DA-DA","formed_note":"1989年8月結成。松竹芸能公式プロフィールで2009年11月解散・DA-DAとしての活動歴も整合。"},
  "シャングリラ":{"formed":"2009","formed_verified":false,"formed_source_type":"二次資料＋KOC公式年代整合","formed_source":"https://ja.unionpedia.org/%E7%9C%9F%E5%A4%9C%E4%B8%AD%E3%83%91%E3%83%B3%E3%83%81%E3%82%A3","formed_note":"旧吉本トリオ。2009年結成、KOC2009出場と年代整合。"}
};
for(const [nm,meta] of Object.entries(FORMED_YEAR_CONFIDENCE_B_V150)){
  const d=DB.find(x=>normName(x.name)===normName(nm)||(x.aliases||[]).some(a=>normName(a)===normName(nm)));
  if(d && !d.formed) Object.assign(d,meta);
}

/* ---- retained patch boundary ---- */

// v152 verified formation-year batch 7
const FORMED_YEAR_V152={"九ノ段":{"formed":"2022","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/22416.html"},"入学卒業":{"formed":"2022","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/19253.html"},"天ぷ然":{"formed":"2025","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/34299.html"},"南天":{"formed":"2025","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/34298.html"},"太宰":{"formed":"2021","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/17000.html"},"二十八":{"formed":"2023","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/22984.html","formed_note":"現行2人組（白川部創真・木村太之輔）の公式ページを採用。旧3人組の同名ページは別編成。"},"檸檬":{"formed":"2024","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/27362.html","formed_note":"現行吉本所属（リー ミチハル・辰巳）の公式ページを採用。同名別組は除外。"}};
for(const [nm,meta] of Object.entries(FORMED_YEAR_V152)){const d=DB.find(x=>x.name===nm||(x.aliases||[]).includes(nm));if(d)Object.assign(d,meta);}

/* ---- retained patch boundary ---- */

// v164 formation-year research continuation.
// Reconstructed from v160 because the intermediate v161-v163 artifact was not available.
// Only still-blank formation years are filled; confirmed/provisional status is preserved in metadata.
const FORMED_YEAR_V164={"にゅ～くれ～ぷ":{"formed":"2008","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"複数資料照合","formed_note":"DBのKOC 2010準決勝は、2008年結成の旧トリオ（ポラロイドマガジン系統）を指すため2008年を採用。2023年再結成の現行2人組とは区別。"},"回転ハッスル":{"formed":"2008","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"よしもと漫才劇場公式YouTube","formed_note":"2008年11月結成との公式動画記載を採用。"},"まえうしろ":{"formed":"2007","formed_batch":"v164-research-continuation","formed_verified":false,"formed_source_type":"NSC期・プロフィール照合（暫定）","formed_note":"両メンバーが2007年4月入学のNSC東京13期で、同期結成とのプロフィール記載から2007年を暫定採用。明示的な結成月日は未確認。"},"スタローン":{"formed":"2015","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"限定ユニット資料照合","formed_note":"通常の固定コンビではなく2015年2月に組まれた限定ユニット。DBのM-1 2015戦績と一致するため2015年を採用。"},"天然もろこし":{"formed":"2002","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E5%A4%A9%E7%84%B6%E3%82%82%E3%82%8D%E3%81%93%E3%81%97&searchbtn=1","formed_note":"M-1公式で2002年2月結成。"},"雷鳴":{"formed":"2015","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E9%9B%B7%E9%B3%B4&searchbtn=1","formed_note":"M-1公式で2015年3月21日結成。"},"野良鯨":{"formed":"2016","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E9%87%8E%E8%89%AF%E9%AF%A8&searchbtn=1","formed_note":"M-1公式で2016年結成。"},"元ホスト":{"formed":"2015","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E5%85%83%E3%83%9B%E3%82%B9%E3%83%88&searchbtn=1","formed_note":"M-1公式で2015年8月1日結成。"},"レイカーズ":{"formed":"2001","formed_batch":"v164-research-continuation","formed_verified":false,"formed_source_type":"二次プロフィール資料","formed_note":"2001年結成・2005年解散とのプロフィール資料を採用。DBのM-1 2003準決勝と年代整合。"},"ハニーベージュ":{"formed":"2005","formed_batch":"v164-research-continuation","formed_verified":false,"formed_source_type":"二次プロフィール資料","formed_note":"2005年結成とのプロフィール資料を採用。DBのM-1 2016 3回戦と同名・メンバー系統を照合。"},"マエダtoギガ":{"formed":"2015","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%83%9E%E3%82%A8%E3%83%80to%E3%82%AE%E3%82%AC&searchbtn=1","formed_note":"M-1公式で2015年7月7日結成。"},"ももかんラッシー":{"formed":"2013","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%82%82%E3%82%82%E3%81%8B%E3%82%93%E3%83%A9%E3%83%83%E3%82%B7%E3%83%BC&searchbtn=1","formed_note":"M-1公式で2013年10月1日結成。"},"ロズウェル":{"formed":"2025","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%83%AD%E3%82%BA%E3%82%A6%E3%82%A7%E3%83%AB&searchbtn=1","formed_note":"M-1公式で2025年2月9日結成。"},"しすい":{"formed":"2025","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%81%97%E3%81%99%E3%81%84&searchbtn=1","formed_note":"M-1公式で2025年7月17日結成。"},"プラズマ万馬券":{"formed":"2024","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%83%97%E3%83%A9%E3%82%BA%E3%83%9E%E4%B8%87%E9%A6%AC%E5%88%B8&searchbtn=1","formed_note":"M-1公式で2024年6月1日結成。"},"すみれぐみ":{"formed":"2025","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%81%99%E3%81%BF%E3%82%8C%E3%81%90%E3%81%BF&searchbtn=1","formed_note":"M-1公式で2025年1月20日結成。"},"ブロードアピール":{"formed":"2024","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%83%96%E3%83%AD%E3%83%BC%E3%83%89%E3%82%A2%E3%83%94%E3%83%BC%E3%83%AB&searchbtn=1","formed_note":"M-1公式で2024年4月30日結成。"},"ラージャン":{"formed":"2024","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%83%A9%E3%83%BC%E3%82%B8%E3%83%A3%E3%83%B3&searchbtn=1","formed_note":"M-1公式で2024年12月2日結成。"},"祝。エペ":{"formed":"2020","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E7%A5%9D%E3%80%82%E3%82%A8%E3%83%9A&searchbtn=1","formed_note":"M-1公式で2020年4月1日結成。"},"フロウフシ":{"formed":"2020","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%83%95%E3%83%AD%E3%82%A6%E3%83%95%E3%82%B7&searchbtn=1","formed_note":"M-1公式で2020年6月結成。"},"カットミドルベイビーズ":{"formed":"2023","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%82%AB%E3%83%83%E3%83%88%E3%83%9F%E3%83%89%E3%83%AB%E3%83%99%E3%82%A4%E3%83%93%E3%83%BC%E3%82%BA&searchbtn=1","formed_note":"M-1公式で2023年8月28日結成。"},"サぺい":{"formed":"2023","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%82%B5%E3%81%BA%E3%81%84&searchbtn=1","formed_note":"M-1公式で2023年6月1日結成。"},"ロマンティックベイベー":{"formed":"2020","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%83%AD%E3%83%9E%E3%83%B3%E3%83%86%E3%82%A3%E3%83%83%E3%82%AF%E3%83%99%E3%82%A4%E3%83%99%E3%83%BC&searchbtn=1","formed_note":"M-1公式で2020年8月30日結成。"},"鱒之介":{"formed":"2010","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E9%B1%92%E4%B9%8B%E4%BB%8B&searchbtn=1","formed_note":"M-1公式で2010年4月10日結成。"},"チル":{"formed":"2017","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%83%81%E3%83%AB&searchbtn=1","formed_note":"M-1公式コンビ一覧で2017年結成。"},"人種三兄弟":{"formed":"2018","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E4%BA%BA%E7%A8%AE%E4%B8%89%E5%85%84%E5%BC%9F&searchbtn=1","formed_note":"M-1公式で2018年4月1日結成。"},"薔薇とノンフィクション":{"formed":"2017","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E8%96%94%E8%96%87%E3%81%A8%E3%83%8E%E3%83%B3%E3%83%95%E3%82%A3%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3&searchbtn=1","formed_note":"M-1公式で2017年8月5日結成。"},"ウサギとトカゲ":{"formed":"2015","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%82%A6%E3%82%B5%E3%82%AE%E3%81%A8%E3%83%88%E3%82%AB%E3%82%B2&searchbtn=1","formed_note":"M-1公式で2015年結成。"},"うめぼしかんがるー":{"formed":"2016","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%81%86%E3%82%81%E3%81%BC%E3%81%97%E3%81%8B%E3%82%93%E3%81%8C%E3%82%8B%E3%83%BC&searchbtn=1","formed_note":"M-1公式コンビ一覧で2016年結成。"},"命尽きるまで":{"formed":"2016","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E5%91%BD%E5%B0%BD%E3%81%8D%E3%82%8B%E3%81%BE%E3%81%A7&searchbtn=1","formed_note":"M-1公式で2016年5月1日結成。"},"超新塾4/6":{"formed":"2016","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E8%B6%85%E6%96%B0%E5%A1%BE4%2F6&searchbtn=1","formed_note":"M-1公式で2016年8月1日結成。"},"漫才うけ太・わろ太":{"formed":"2016","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E6%BC%AB%E6%89%8D%E3%81%86%E3%81%91%E5%A4%AA%E3%83%BB%E3%82%8F%E3%82%8D%E5%A4%AA&searchbtn=1","formed_note":"M-1公式で2016年4月結成。"},"バケモンズ":{"formed":"2013","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%83%90%E3%82%B1%E3%83%A2%E3%83%B3%E3%82%BA&searchbtn=1","formed_note":"M-1公式コンビ一覧で2013年結成。"},"ニュージーズ":{"formed":"2015","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%83%8B%E3%83%A5%E3%83%BC%E3%82%B8%E3%83%BC%E3%82%BA&searchbtn=1","formed_note":"M-1公式で2015年結成。"},"顔色よろしわろし":{"formed":"2010","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E9%A1%94%E8%89%B2%E3%82%88%E3%82%8D%E3%81%97%E3%82%8F%E3%82%8D%E3%81%97&searchbtn=1","formed_note":"M-1公式で2010年1月1日結成。"},"ヒラメカレイ":{"formed":"2015","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%83%92%E3%83%A9%E3%83%A1%E3%82%AB%E3%83%AC%E3%82%A4&searchbtn=1","formed_note":"M-1公式コンビ一覧で2015年結成。"},"ビギン！ナウ":{"formed":"2013","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%83%93%E3%82%AE%E3%83%B3%EF%BC%81%E3%83%8A%E3%82%A6&searchbtn=1","formed_note":"M-1公式で2013年4月1日結成。"},"扉ノッカーズ（仮）":{"formed":"2015","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E6%89%89%E3%83%8E%E3%83%83%E3%82%AB%E3%83%BC%E3%82%BA%EF%BC%88%E4%BB%AE%EF%BC%89&searchbtn=1","formed_note":"M-1公式で2015年3月1日結成。"},"所ローズ":{"formed":"2016","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E6%89%80%E3%83%AD%E3%83%BC%E3%82%BA&searchbtn=1","formed_note":"M-1公式で2016年5月1日結成。"},"カーチェイス":{"formed":"2017","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%82%AB%E3%83%BC%E3%83%81%E3%82%A7%E3%82%A4%E3%82%B9&searchbtn=1","formed_note":"M-1公式で2017年結成。"},"じゃがいもタルト":{"formed":"2014","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%81%98%E3%82%83%E3%81%8C%E3%81%84%E3%82%82%E3%82%BF%E3%83%AB%E3%83%88&searchbtn=1","formed_note":"M-1公式で2014年11月28日結成。"},"マーガレット":{"formed":"2008","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/detail.html?id=953","formed_note":"M-1公式の2019年出場コンビページで2008年結成。2022年結成の同名別コンビは除外。"},"ミートばいばい":{"formed":"2017","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/detail.html?id=7599","formed_note":"M-1公式で2017年12月結成。"},"花いちもんめ2":{"formed":"2019","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/11492.html","formed_note":"M-1公式で2019年結成。"},"ゼウスの申し子":{"formed":"2015","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/2642.html","formed_note":"M-1公式で2015年結成。"},"ニュー梅林":{"formed":"2008","formed_batch":"v164-research-continuation","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/detail.html?id=2266","formed_note":"M-1公式で2008年4月1日結成。"}};
for(const [nm,meta] of Object.entries(FORMED_YEAR_V164)){
  const d=DB.find(x=>normName(x.name)===normName(nm)||(x.aliases||[]).some(a=>normName(a)===normName(nm)));
  if(d && !d.formed) Object.assign(d,meta);
}

// v165 rally1 formation-year additions. Confirmed and tentative values are explicitly separated by formed_verified.
const FORMED_YEAR_V165={"赤リトル":{"formed":"2021","formed_batch":"v165-rally1","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E8%B5%A4%E3%83%AA%E3%83%88%E3%83%AB&searchbtn=1","formed_note":"M-1公式で2021年結成を確認。"},"馬稼業":{"formed":"2016","formed_batch":"v165-rally1","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/4050.html","formed_note":"M-1公式で2016年7月16日結成。"},"点々":{"formed":"2022","formed_batch":"v165-rally1","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/25873.html","formed_note":"M-1公式で2022年4月25日結成。"},"ボケボケマンボーズ":{"formed":"2018","formed_batch":"v165-rally1","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%83%9C%E3%82%B1%E3%83%9C%E3%82%B1%E3%83%9E%E3%83%B3%E3%83%9C%E3%83%BC%E3%82%BA&searchbtn=1","formed_note":"M-1公式で2018年結成を確認。"},"パンドラ":{"formed":"2014","formed_batch":"v165-rally1","formed_verified":true,"formed_source_type":"M-1公式・メンバー照合","formed_source":"https://www.m-1gp.com/combi/60.html","formed_note":"DBのM-1 2017・2018出場は松竹芸能の伊東和輝／福田和真組と照合。M-1公式で2014年10月1日結成。同名別組は除外。"},"ジェットゥーゾ":{"formed":"2009","formed_batch":"v165-rally1","formed_verified":true,"formed_source_type":"M-1公式アーカイブ","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%82%B8%E3%82%A7%E3%83%83%E3%83%88%E3%82%A5%E3%83%BC%E3%82%BE&searchbtn=1","formed_note":"M-1公式のコンビ情報・大会履歴から2009年結成を確認。"},"アゲアゲボーイズ":{"formed":"2018","formed_batch":"v165-rally1","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%82%A2%E3%82%B2%E3%82%A2%E3%82%B2%E3%83%9C%E3%83%BC%E3%82%A4%E3%82%BA&searchbtn=1","formed_note":"M-1公式で2018年8月1日結成。"},"じぇんば じぇんば":{"formed":"2015","formed_batch":"v165-rally1","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%81%98%E3%81%87%E3%82%93%E3%81%B0+%E3%81%98%E3%81%87%E3%82%93%E3%81%B0&searchbtn=1","formed_note":"M-1公式で2015年1月1日結成。旧表記が近い別組はDB戦績と切り分け。"},"サヨナラホームラン":{"formed":"2013","formed_batch":"v165-rally1","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%82%B5%E3%83%A8%E3%83%8A%E3%83%A9%E3%83%9B%E3%83%BC%E3%83%A0%E3%83%A9%E3%83%B3&searchbtn=1","formed_note":"M-1公式で2013年4月1日結成。"},"おかえりフェスティバル":{"formed":"2019","formed_batch":"v165-rally1","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%81%8A%E3%81%8B%E3%81%88%E3%82%8A%E3%83%95%E3%82%A7%E3%82%B9%E3%83%86%E3%82%A3%E3%83%90%E3%83%AB&searchbtn=1","formed_note":"M-1公式で2019年6月7日結成。"},"美たんさん":{"formed":"2009","formed_batch":"v165-rally1","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E7%BE%8E%E3%81%9F%E3%82%93%E3%81%95%E3%82%93&searchbtn=1","formed_note":"M-1公式で2009年8月1日結成。"},"美豚ズ":{"formed":"2017","formed_batch":"v165-rally1","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E7%BE%8E%E8%B1%9A%E3%82%BA&searchbtn=1","formed_note":"M-1公式で2017年8月結成。"},"電氣ブラン":{"formed":"2014","formed_batch":"v165-rally1","formed_verified":true,"formed_source_type":"吉本公式系資料","formed_note":"よしもと漫才劇場公式コンテンツのプロフィール記載から2014年6月結成を確認。"},"A面":{"formed":"2022","formed_batch":"v165-rally1","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=A%E9%9D%A2&searchbtn=1","formed_note":"M-1公式で2022年9月1日結成。KOC 2024準々決勝組と照合。"},"中村ホルモン":{"formed":"2015","formed_batch":"v165-rally1","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E4%B8%AD%E6%9D%91%E3%83%9B%E3%83%AB%E3%83%A2%E3%83%B3&searchbtn=1","formed_note":"M-1公式で2015年結成を確認。DBのM-1 2015 3回戦と一致。"},"劇団スティック":{"formed":"2021","formed_batch":"v165-rally1","formed_verified":true,"formed_source_type":"J-WAVE＋KOC公式照合","formed_note":"2021年5月に劇団スティック旗揚げとの本人関連資料を、KOC 2023準々決勝の同名チームと照合し2021年を採用。"},"トリプル家族":{"formed":"2025","formed_batch":"v165-rally1","formed_verified":true,"formed_source_type":"主要メディア＋KOC戦績照合","formed_note":"2025年結成の2人組がKOC 2025に「トリプル家族」で出場したことを主要メディアと大会情報で照合。"},"ザニーフランク":{"formed":"2020","formed_batch":"v165-rally1","formed_verified":false,"formed_source_type":"お笑いデータベース（二次）","formed_note":"二次データベースに2020年5月29日結成。KOC 2021戦績と時系列整合。"},"三匹":{"formed":"2020","formed_batch":"v165-rally1","formed_verified":false,"formed_source_type":"プロフィール・二次資料照合","formed_note":"複数プロフィール／二次データで2020年1月1日結成。KOC 2020戦績と整合するため暫定採用。"},"メトロクラフト":{"formed":"2016","formed_batch":"v165-rally1","formed_verified":false,"formed_source_type":"お笑いデータベース（二次）","formed_note":"二次データベースで2016年3月1日結成。DBのM-1 2016戦績と整合。以前の2010年候補は採用しない。"},"ニュートンズ":{"formed":"2020","formed_batch":"v165-rally1","formed_verified":false,"formed_source_type":"所属・養成所資料等の複数照合","formed_note":"WCS30期の在学中結成・2020年デビュー資料を複数照合し2020年を暫定採用。明示的な結成月日は未確認。"},"閃光少女":{"formed":"2016","formed_batch":"v165-rally1","formed_verified":false,"formed_source_type":"主要メディア照合","formed_note":"2016年に現メンバーで新コンビとして活動開始した報道とM-1 2016戦績を照合し2016年を暫定採用。"},"とりはげ":{"formed":"2017","formed_batch":"v165-rally1","formed_verified":false,"formed_source_type":"プロフィール・戦績照合","formed_note":"2017年に一時ユニットとして組み、同年M-1で「とりはげ」として3回戦進出した経歴から2017年を暫定採用。"},"ダイキリ":{"formed":"2013","formed_batch":"v165-rally1","formed_verified":false,"formed_source_type":"二次プロフィール","formed_note":"活動期間を2013年開始とする二次プロフィールから2013年を暫定採用。"},"あまからひやし":{"formed":"2016","formed_batch":"v165-rally1","formed_verified":false,"formed_source_type":"人力舎公式＋KOC公式（時系列特定）","formed_note":"JCA25期として2016年5月入学、同年7月KOC出場・11月JCA公式ライブ出演を確認。明示的な結成月日はないため年のみ暫定採用。"},"昨年のMVP":{"formed":"2023","formed_batch":"v165-rally1","formed_verified":false,"formed_source_type":"本人関連資料＋KOC戦績照合","formed_note":"堀川ランプとそるとのユニットとして2023年に結成されたことを複数資料とKOC 2023戦績で照合。明示的な公式結成日は未確認。"},"たんぽぽメダル":{"formed":"2023","formed_batch":"v165-rally1","formed_verified":false,"formed_source_type":"KOC出場ユニット照合","formed_note":"真輝志＋ソマオ・ミートボールのKOC 2023ユニットとして確認。固定コンビではないため2023年をユニット結成年として暫定採用。"},"トライデント":{"formed":"2024","formed_batch":"v165-rally1","formed_verified":false,"formed_source_type":"KOC出場ユニット照合","formed_note":"真輝志＋シゲカズです＋河野良祐のKOC 2024ユニットとして確認。固定コンビではないため2024年をユニット結成年として暫定採用。"}};
for(const [n,m] of Object.entries(FORMED_YEAR_V165)){const d=DB.find(x=>x.name===n);if(d&&!d.formed)Object.assign(d,m);}

// v166 rally1b: second reduction pass.
const FORMED_YEAR_V166={"戎":{"formed":"2015","formed_batch":"v166-rally1b","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E6%88%8E&searchbtn=1","formed_note":"M-1公式コンビ一覧で、DBの2017年3回戦組「戎」の結成年が2015年と確認できる。"},"大阪ほっと家族":{"formed":"2013","formed_batch":"v166-rally1b","formed_verified":true,"formed_source_type":"よしもと漫才劇場公式YouTube","formed_note":"よしもと漫才劇場公式のお披露目動画説明欄に「大阪ほっと家族 2013年4月結成」と明記。"},"ガイガジン":{"formed":"2016","formed_batch":"v166-rally1b","formed_verified":true,"formed_source_type":"お笑いナタリー","formed_note":"お笑いナタリーがガイとウガジンについて「2016年に結成」と明記。KOC 2019準々決勝組と一致。"},"新作のスイッチ企画":{"formed":"2022","formed_batch":"v166-rally1b","formed_verified":true,"formed_source_type":"当事者一次資料＋KOC公式","formed_note":"どくさいスイッチ企画本人の記録で2022年6月26日「新作のスイッチ企画」結成。KOC 2022準々決勝戦績と一致。"},"塩醤油":{"formed":"2021","formed_batch":"v166-rally1b","formed_verified":true,"formed_source_type":"本人発言を報じたメディア＋KOC公式","formed_note":"2021年KOC出場のために結成された男女ピン芸人ユニットとの本人発言報道を採用。KOC 2021準々決勝組と一致。"},"人間っていいな":{"formed":"2017","formed_batch":"v166-rally1b","formed_verified":false,"formed_source_type":"メンバー紹介記事（二次）","formed_note":"星河・やなぼう・松井のトリオとして2017年結成とのメンバー紹介記事を確認。公式の明示的結成年は未確認のため暫定。"},"フルフロンタル":{"formed":"2012","formed_batch":"v166-rally1b","formed_verified":false,"formed_source_type":"吉本公式インタビューから時系列推定","formed_note":"幼なじみ2人が大学卒業後にコンビ活動を始め、約1年独力で活動した後2013年度NSC東京19期へ入学した公式インタビューから2012年を暫定採用。明示的な結成年表記は未確認。"},"ロールキャベツ団地":{"formed":"2017","formed_batch":"v166-rally1b","formed_verified":false,"formed_source_type":"吉本公式NSC在籍資料から時系列推定","formed_note":"NSC大阪40期（2017年度入学）在学中にコンビとして活動し、2018年2月NSC大ライブ決勝進出。2017年結成を暫定採用。"},"親指ダンサー":{"formed":"2021","formed_batch":"v166-rally1b","formed_verified":false,"formed_source_type":"M-1 2021ユニット資料照合","formed_note":"元チャモロのハリーと親指ぎゅー太郎によるピン芸人同士のユニットとしてM-1 2021で確認。固定コンビではないため大会ユニット年の2021を暫定採用。"},"清川くんと苺ちゃん":{"formed":"2023","formed_batch":"v166-rally1b","formed_verified":false,"formed_source_type":"KOC 2023ユニット初出照合","formed_note":"KOC 2023で確認されるピン芸人ユニット。2023大会用ユニットとしての初出年を暫定採用。明示的な結成日は未確認。"},"人間喜劇ごっこ":{"formed":"2024","formed_batch":"v166-rally1b","formed_verified":false,"formed_source_type":"KOC 2024・FANY出演者照合","formed_note":"吉本新喜劇メンバーによるユニットとしてKOC 2024準々決勝で確認。固定コンビではないため大会ユニット年の2024を暫定採用。"}};
for(const [n,m] of Object.entries(FORMED_YEAR_V166)){const d=DB.find(x=>x.name===n);if(d&&!d.formed)Object.assign(d,m);}

/* ---- retained patch boundary ---- */

// v167 rally2: strong confirmed values + explicit provisional first-confirmed-year values.
const FORMED_YEAR_V167={"30度バンク":{"formed":"2015","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大学芸会公式系記録（暫定）","formed_source":"https://daigakugeikai.wixsite.com/owaraicircle/2015","formed_note":"2015年の大学芸会個人戦優勝とM-1 2015 3回戦を確認。結成年の明記はないため2015年を活動確認年として暫定採用。"},"83幕府":{"formed":"2010","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://archive.king-of-conte.com/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"ULTRA SUPER BOYS":{"formed":"2023","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"KOC公式・ユニット初出（暫定）","formed_source":"https://archive.king-of-conte.com/2023/schedule/y01-19/index.html","formed_note":"KOC 2023でユニットとして1回戦から準々決勝まで確認。結成年明記は未確認のため2023年を暫定採用。"},"ZEN":{"formed":"2012","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://archive.king-of-conte.com/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"アンゲラー":{"formed":"2017","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://archive.king-of-conte.com/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"アンチAIシステム":{"formed":"2025","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://archive.king-of-conte.com/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"いけばな教室":{"formed":"2009","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://www.m-1gp.com/history/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"イザベルとベネ":{"formed":"2001","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://www.m-1gp.com/history/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"ヴィーナスライン":{"formed":"2021","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://archive.king-of-conte.com/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"うがじん":{"formed":"2003","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://www.m-1gp.com/history/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"エージェント":{"formed":"2004","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://www.m-1gp.com/history/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"からあげディスコ":{"formed":"2012","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://archive.king-of-conte.com/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"カルパチーノ":{"formed":"2004","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"M-1公式アーカイブ初確認年（暫定）","formed_source":"https://www.m-1gp.com/archive/2004/","formed_note":"DBは2006準決勝だが、M-1公式アーカイブで2004年時点の同名活動を確認。結成年明記は未確認のため2004年を暫定採用。"},"キャサリン":{"formed":"2023","formed_batch":"v167-rally2","formed_verified":true,"formed_source_type":"M-1公式","formed_source":"https://www.m-1gp.com/combi/29125.html","formed_note":"M-1公式でエクスカリバー／牛魔王の組を2023年4月1日結成と確認。2025年まで同メンバーで活動しており、2024年結成の別同名組は除外。"},"ザ・マンモス":{"formed":"2009","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://archive.king-of-conte.com/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"サージェント":{"formed":"2023","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://www.m-1gp.com/history/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"サメゾンビ":{"formed":"2019","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://archive.king-of-conte.com/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"さんだあず":{"formed":"2005","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://www.m-1gp.com/history/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"さんてん堂":{"formed":"2019","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://www.m-1gp.com/history/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"シーナリーズ":{"formed":"2025","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://archive.king-of-conte.com/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"しおさい":{"formed":"2024","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"所属表記付き主催ページ（暫定）","formed_source":"https://tiget.net/users/1067786","formed_note":"ビクターミュージックアーツ所属コンビとして少なくとも2024年1月から活動記録あり。結成年明記はないため2024年を暫定採用。"},"シンエサカ":{"formed":"2025","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://archive.king-of-conte.com/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"ストレートタイム":{"formed":"2006","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://archive.king-of-conte.com/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"スペースラジオ":{"formed":"2008","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://archive.king-of-conte.com/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"ソファーズ":{"formed":"2019","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://archive.king-of-conte.com/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"たけちゃんせいちゃん":{"formed":"2024","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"KOC公式・ユニット初出（暫定）","formed_source":"https://archive.king-of-conte.com/2024/news/second-pass/index.html","formed_note":"KOC 2024準々決勝進出ユニット。どんぐりたけし×もりせいじゅの組と照合。結成年明記は未確認。"},"デカメロン":{"formed":"2003","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://www.m-1gp.com/history/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"なきっつらにT-REX":{"formed":"2022","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"ワタナベ公式活動記録（暫定）","formed_source":"https://www.watanabepro.co.jp/liveinfo/14712/","formed_note":"ワタナベ公式ライブで2022年6月に活動を確認し、同年KOC準々決勝進出とも一致。結成年明記は未確認。"},"ノルウェースウェーデン":{"formed":"2015","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://www.m-1gp.com/history/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"パプア。":{"formed":"2008","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://www.m-1gp.com/history/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"ばんどーら":{"formed":"2019","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://archive.king-of-conte.com/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"ビッグスリードラゴンズ":{"formed":"2025","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://archive.king-of-conte.com/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"フェー":{"formed":"2017","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://archive.king-of-conte.com/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"マシュマロ猫背":{"formed":"2024","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"KOC公式・初出年（暫定）","formed_source":"https://archive.king-of-conte.com/2024/schedule/quater-final/03-3/index.html","formed_note":"KOC 2024準々決勝で確認。結成年明記は未確認のため大会初確認年を暫定採用。"},"ママレンジ":{"formed":"2002","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://www.m-1gp.com/history/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"まゆむら":{"formed":"2025","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://archive.king-of-conte.com/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"マラソンズ":{"formed":"2015","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://archive.king-of-conte.com/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"みーとバイバイ":{"formed":"2017","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://www.m-1gp.com/history/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"メメ":{"formed":"2009","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://www.m-1gp.com/history/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"ユキコミキ":{"formed":"2003","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://www.m-1gp.com/history/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"ヨコチョ":{"formed":"2015","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://www.m-1gp.com/history/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"ラストピアス":{"formed":"2019","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://archive.king-of-conte.com/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"ルサンチマン":{"formed":"2006","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://www.m-1gp.com/history/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"ロケットボーイズ":{"formed":"2021","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://archive.king-of-conte.com/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"ロシアン生まれ":{"formed":"2012","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://archive.king-of-conte.com/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"ロッカーズ":{"formed":"2019","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://www.m-1gp.com/history/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"庵":{"formed":"2005","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://www.m-1gp.com/history/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"鶏あえず":{"formed":"2015","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://www.m-1gp.com/history/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"高校デビュー":{"formed":"2007","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://www.m-1gp.com/history/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"三日月トリオ":{"formed":"2009","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://archive.king-of-conte.com/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"女":{"formed":"2025","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"主要メディア・大会ユニット照合（暫定）","formed_source":"https://natalie.mu/owarai/news/671163","formed_note":"寺尾巨神兵×二口りぼ～なすのユニットとしてM-1 2025 3回戦進出。正式コンビ化は2026年5月7日なので、DBの2025戦績にはユニット開始年2025を暫定採用。"},"少年ギャング":{"formed":"2002","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://www.m-1gp.com/history/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"石田・花子":{"formed":"2001","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://www.m-1gp.com/history/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"大絶賛":{"formed":"2024","formed_batch":"v167-rally2","formed_verified":true,"formed_source_type":"当事者一次資料＋KOC公式","formed_source":"https://note.com/0210atomu/n/n7f87e647a798","formed_note":"メンバーのあとむ本人がKOC 2024期間中に「新しいユニット」と明記。おしみんまる×あとむの大絶賛としてKOC公式戦績とも一致するため2024年を採用。"},"豆腐":{"formed":"2016","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://www.m-1gp.com/history/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"日刊ナンセンス":{"formed":"2006","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://www.m-1gp.com/history/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"},"平安":{"formed":"2025","formed_batch":"v167-rally2","formed_verified":false,"formed_source_type":"大会・公的活動の初確認年（暫定）","formed_source":"https://www.m-1gp.com/history/","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。"}};
for(const [n,m] of Object.entries(FORMED_YEAR_V167)){const d=DB.find(x=>x.name===n);if(d&&!d.formed)Object.assign(d,m);}

/* ---- retained patch boundary ---- */

// v168 final formation-year completion batch.
// Exact formation years and cautious earliest-confirmed-year proxies are explicitly separated by formed_verified.
const FORMED_YEAR_V168={"G-SHOCK":{"formed":"2016","formed_batch":"v168-final14","formed_verified":false,"formed_source_type":"DB対象大会年プロキシ（同名照合未完）","formed_source":"https://www.m-1gp.com/","formed_note":"DB対象はM-1 2016 3回戦のアマチュア組。2009・2010にも同名アマチュア記録があるが同一組と断定できないため、DB対象個体を確実に確認できる2016年を暫定採用。"},"アストロNエース":{"formed":"2011","formed_batch":"v168-final14","formed_verified":false,"formed_source_type":"KOC公式・最古確認年プロキシ","formed_source":"https://archive.king-of-conte.com/2011/dvd.html","formed_note":"KOC 2011準決勝進出を公式アーカイブで確認。明示的な結成年は未確認のため2011年を最古確認年として暫定採用。"},"イシクラノオノ":{"formed":"2008","formed_batch":"v168-final14","formed_verified":false,"formed_source_type":"KOC公式・最古確認年プロキシ","formed_source":"https://archive.king-of-conte.com/2008/schedule/0727.html","formed_note":"KOC 2008公式1回戦出場で石倉竜馬・小野大樹のコンビ活動を確認。結成年明記は未確認のため2008年を暫定採用。"},"くのいち":{"formed":"2014","formed_batch":"v168-final14","formed_verified":true,"formed_source_type":"プロフィール資料＋メンバー照合","formed_source":"https://thetv.jp/person/2000011133/","formed_note":"ちぇく田・どんまい高橋のコンビ。2014年3月結成、2017年解散と明記。DBのM-1 2015/2016戦績と年代・メンバーが一致。"},"ざくろ":{"formed":"2016","formed_batch":"v168-final14","formed_verified":false,"formed_source_type":"DB対象大会年プロキシ（同名照合未完）","formed_source":"https://www.m-1gp.com/","formed_note":"DB対象はM-1 2016 3回戦のアマチュア組。2010にも同名アマチュア記録があるが同一組と断定できないため2016年を暫定採用。"},"ジプシーダンス":{"formed":"2012","formed_batch":"v168-final14","formed_verified":false,"formed_source_type":"KOC戦績・活動資料の最古確認年プロキシ","formed_source":"https://archive.king-of-conte.com/","formed_note":"DBのKOC 2012準決勝進出個体として2012年まで活動を確認。結成年そのものの明示資料を確保できていないため2012年を暫定採用。"},"チャリンコクラブ":{"formed":"2015","formed_batch":"v168-final14","formed_verified":false,"formed_source_type":"演芸賞公式・最古確認年プロキシ","formed_source":"https://walive.org/syabekuri_wagei/278/","formed_note":"2015年の第4回関西演芸しゃべくり話芸大賞で準グランプリ・決勝出場を確認。DBのM-1 2018以前の活動が確認できるため2015年を暫定採用。"},"ボヘミアン":{"formed":"2017","formed_batch":"v168-final14","formed_verified":false,"formed_source_type":"DB対象大会年プロキシ（同名多数）","formed_source":"https://www.m-1gp.com/","formed_note":"DB対象はM-1 2017 3回戦の組。2005・2007・2009および2024にも同名アマチュア組が存在し、同一性を立証できないためDB対象年2017を暫定採用。"},"花鳥風月":{"formed":"2002","formed_batch":"v168-final14","formed_verified":false,"formed_source_type":"M-1公式アーカイブ・最古確認年プロキシ（同名分離）","formed_source":"https://www.m-1gp.com/archive/2002/1201.htm","formed_note":"DB対象はM-1 2002準決勝の吉本興業大阪組。現行M-1ページの2008年結成・緒方夏美/ナスエ組は別個体のため除外。旧組の結成日は未確認なので2002年を暫定採用。"},"太く清く":{"formed":"2020","formed_batch":"v168-final14","formed_verified":false,"formed_source_type":"KOC公式・最古確認年プロキシ","formed_source":"https://archive.king-of-conte.com/2020/result.html","formed_note":"太田芳伸・清水啓之の組としてKOC 2020公式記録で活動を確認。結成年明記は未確認のため2020年を暫定採用。"},"池袋イーストゲートパーク":{"formed":"2023","formed_batch":"v168-final14","formed_verified":false,"formed_source_type":"M-1対象大会年プロキシ","formed_source":"https://www.m-1gp.com/","formed_note":"DBのM-1 2023 3回戦進出組として確認。結成年の明示資料は未確認のため2023年を暫定採用。"},"鶴と松":{"formed":"2015","formed_batch":"v168-final14","formed_verified":false,"formed_source_type":"M-1対象大会年プロキシ","formed_source":"https://www.m-1gp.com/","formed_note":"DBのM-1 2015 3回戦進出組として確認。結成年の明示資料は未確認のため2015年を暫定採用。"},"藤井ランド":{"formed":"2021","formed_batch":"v168-final14","formed_verified":false,"formed_source_type":"KOC公式・ユニット初確認年プロキシ","formed_source":"https://archive.king-of-conte.com/2021/2021/07/post-7.html","formed_note":"KOC 2021準々決勝進出を公式アーカイブで確認。結成年明記は未確認のため2021年を暫定採用。"},"藤井ンド":{"formed":"2021","formed_batch":"v168-final14","formed_verified":false,"formed_source_type":"KOC公式・ユニット初確認年プロキシ","formed_source":"https://archive.king-of-conte.com/2021/2021/05/ss02.html","formed_note":"KOC 2021準々決勝日程で公式に確認。結成年明記は未確認のため2021年を暫定採用。"}};
for(const [n,m] of Object.entries(FORMED_YEAR_V168)){const d=DB.find(x=>x.name===n);if(d&&!d.formed)Object.assign(d,m);}

/* ---- retained patch boundary ---- */

// v204 checkpoint: base-normalization + 100-name agency/activity research + identity audit.
(() => {
  const FORMATION_V204={
    "おしみん守谷":{formed:"2022",formed_verified:true,formed_research_status:"RESOLVED",formed_source_type:"当事者インタビュー＋KOC公式",formed_source:"https://note.com/geininn/n/n3c1ac0c3b2dd",formed_source_note:"同一メンバーのユニット『おしみん守谷まる日和』としてKOC 2022に初出場し、2023年は短縮名『おしみん守谷』で出場。年単位のユニット起点を2022年として統合。",formed_batch:"v204-name-normalization"},
    "cacao":{formed:"2020",formed_verified:true,formed_source:"https://profile.yoshimoto.co.jp/talent/detail?id=7289",formed_source_type:"吉本興業公式",formed_research_status:"RESOLVED"},
    "アモーン":{formed:"2006",formed_verified:true,formed_source:"https://asaikikaku.co.jp/talent/profile/ammon",formed_source_type:"浅井企画公式",formed_research_status:"RESOLVED"},
    "ザ・ギース":{formed:"2004",formed_verified:true,formed_source:"https://ash-d.info/talent/thegeese/",formed_source_type:"ASH&D公式",formed_research_status:"RESOLVED"},
    "シティホテル3号室":{formed:"2012",formed_verified:true,formed_source:"https://www.titan-net.co.jp/live/cityhotel3goushitsu/",formed_source_type:"タイタン公式",formed_research_status:"RESOLVED"},
    "スタミナパン":{formed:"2014",formed_verified:true,formed_source:"https://www.sma.co.jp/s/sma/artist/655",formed_source_type:"SMA公式",formed_research_status:"RESOLVED"},
    "ずん":{formed:"2000",formed_verified:true,formed_source:"https://asaikikaku.co.jp/talent/profile/zun",formed_source_type:"浅井企画公式",formed_research_status:"RESOLVED"},
    "ぎょうぶ":{formed:"2018",formed_verified:true,formed_source:"https://profile.yoshimoto.co.jp/talent/detail?id=7488",formed_source_type:"吉本興業公式",formed_research_status:"RESOLVED"},
    "ジェラードン":{formed:"2008",formed_verified:true,formed_source:"https://profile.yoshimoto.co.jp/talent/detail?id=3450",formed_source_type:"吉本興業公式",formed_research_status:"RESOLVED"},
    "さや香":{formed:"2014",formed_verified:true,formed_source:"https://profile.yoshimoto.co.jp/talent/detail?id=6046",formed_source_type:"吉本興業公式",formed_research_status:"RESOLVED"},
    "そいつどいつ":{formed:"2015",formed_verified:true,formed_source:"https://profile.yoshimoto.co.jp/talent/detail?id=6796",formed_source_type:"吉本興業公式",formed_research_status:"RESOLVED"}
  };
  for(const [name,meta] of Object.entries(FORMATION_V204)){
    const d=DB.find(x=>x.name===name); if(d)Object.assign(d,meta);
  }
  const conflict=DB.find(x=>x.name==="辻本堀江");
  if(conflict){
    delete conflict.formed;
    conflict.formed_verified=false;
    conflict.formed_research_status="UNRESOLVED";
    conflict.formed_source="https://www.m-1gp.com/combi/2540.html";
    conflict.formed_source_type="M-1公式＋旧活動記録（整合性要確認）";
    conflict.formed_source_note="DBにM-1 2015 3回戦記録がある一方、現行M-1公式は結成2016年。旧名『堀江辻本』の過去活動との同一性・再結成範囲を確定できないためUNRESOLVED。";
    conflict.formed_batch="v204-identity-audit";
  }
  for(const d of DB){
    if(d.agency_verified)d.agency_research_status="RESOLVED";
    if(d.activity_status||d.activity_verified||d.recent_activity_year||d.recent_activity_2025)d.activity_research_status="RESOLVED";
    if(d.formed_verified===true)d.formed_research_status="RESOLVED";
    else if(d.formed)d.formed_research_status="UNRESOLVED";
  }
  window.M1KOC_CHECKPOINT={version:"v206",base_count:DB.length,processed_names:30,focus:"agency + activity + formation",agency_verified:DB.filter(d=>d.agency_verified===true).length,agency_unresolved:DB.filter(d=>d.agency_verified!==true).length,agency_unprocessed:0,checked_at:"2026-09-14",new_unresolved:["転転飯店","藤井ランド","藤井ンド"]};
  if(typeof render==="function")render();
})();

// v205 checkpoint: normalized effective agency patches into DB main records.
// 2026-09-14: researched first 100 of the 130 agency-unresolved records from v204.
// Agency and activity are intentionally independent; unresolved values are never inferred as free/active.
// v206 checkpoint: processed the final 30 previously-unresearched agency records.
// 2026-09-14: agency 27 RESOLVED / 3 UNRESOLVED; unprocessed agency records = 0.
// Formation corrections: 三日月トリオ 2009→2008 (provisional earliest official activity), 鶴と松 2015→2011 (official), 八馬 exact date verified.

/* ---- retained patch boundary ---- */

/* v207 second-pass agency research: final authoritative runtime patch */
(()=>{
const P={"アンチAIシステム":{"agency":"複数所属（吉本興業＋松竹芸能）","agency_key":"mixed","agency_verified":true,"agency_source":"https://www.m-1gp.com/combi/33690.html","agency_source_type":"M-1公式","agency_scope":"M-1公式登録所属","affiliation_note":"M-1公式が「プロ（吉本興業/松竹芸能）」と明記。メンバー別・複数所属として管理。","agency_mode":"mixed","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2025","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/33690.html","formed_source_type":"M-1公式","formed_note":"M-1公式：2025年4月1日結成。","formed_batch":"v207-second-pass","formed_research_status":"RESOLVED","activity_source":"https://king-of-conte.com/","activity_research_batch":"v205","activity_research_status":"RESOLVED","activity_last_checked":"2026-09-14"},"アンチパック":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://sakinkd.com/M-1grangprix2019/matome","agency_source_type":"M-1 2019予選集計記録","agency_scope":"M-1 2019大会登録所属","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2014","formed_verified":false,"formed_source":"https://mcwr-1.com/2022/09/26/%E3%80%90%E6%AD%B4%E4%BB%A3%E3%83%A9%E3%82%B9%E3%83%88%E3%82%A4%E3%83%A4%E3%83%BC%E3%81%BE%E3%81%A7%E7%B6%B2%E7%BE%85%E3%80%91%E4%BB%8A%E5%B9%B4%E3%81%AEm-1%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%97/","formed_source_type":"二次資料（M-1結成年一覧）","formed_batch":"v157-bulk-year-index","formed_research_status":"UNRESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"ウサギとトカゲ":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://www.m-1gp.com/archive/2015/schedule/detail.html?id=54","agency_source_type":"M-1公式予選アーカイブ","agency_scope":"M-1 2015大会登録所属","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2015","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%82%A6%E3%82%B5%E3%82%AE%E3%81%A8%E3%83%88%E3%82%AB%E3%82%B2&searchbtn=1","formed_source_type":"M-1公式","formed_note":"M-1公式で2015年結成。","formed_batch":"v164-research-continuation","formed_research_status":"RESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"うめぼしかんがるー":{"agency":"アマチュア","agency_key":"アマチュア","agency_verified":true,"agency_source":"https://o-463ki3ki.hatenablog.com/entry/2016/10/29/131104","agency_source_type":"M-1 2016予選記録","agency_scope":"M-1 2016大会登録区分","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2016","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%81%86%E3%82%81%E3%81%BC%E3%81%97%E3%81%8B%E3%82%93%E3%81%8C%E3%82%8B%E3%83%BC&searchbtn=1","formed_source_type":"M-1公式","formed_note":"M-1公式コンビ一覧で2016年結成。","formed_batch":"v164-research-continuation","formed_research_status":"RESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"おかえりフェスティバル":{"agency":"アマチュア","agency_key":"アマチュア","agency_verified":true,"agency_source":"https://note.com/aka_note_0417/n/ndb4f4a4be987","agency_source_type":"M-1 2021現地予選記録","agency_scope":"M-1 2021大会登録区分","affiliation_note":"同時期のR-1公式でも構成員「おかえりフェスティバル玄」がアマチュア登録。","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2019","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%81%8A%E3%81%8B%E3%81%88%E3%82%8A%E3%83%95%E3%82%A7%E3%82%B9%E3%83%86%E3%82%A3%E3%83%90%E3%83%AB&searchbtn=1","formed_source_type":"M-1公式","formed_note":"M-1公式で2019年6月7日結成。","formed_batch":"v165-rally1","formed_research_status":"RESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"カーチェイス":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://www.m-1gp.com/archive/2017/schedule/detail.html?id=176","agency_source_type":"M-1公式予選アーカイブ","agency_scope":"M-1 2017大会登録所属","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2017","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%82%AB%E3%83%BC%E3%83%81%E3%82%A7%E3%82%A4%E3%82%B9&searchbtn=1","formed_source_type":"M-1公式","formed_note":"M-1公式で2017年結成。","formed_batch":"v164-research-continuation","formed_research_status":"RESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"きよけん":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://sakinkd.com/M-1grangprix2019/matome","agency_source_type":"M-1 2019予選集計記録","agency_scope":"M-1 2019大会登録所属","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2019","formed_verified":false,"formed_source":"https://mcwr-1.com/2022/09/26/%E3%80%90%E6%AD%B4%E4%BB%A3%E3%83%A9%E3%82%B9%E3%83%88%E3%82%A4%E3%83%A4%E3%83%BC%E3%81%BE%E3%81%A7%E7%B6%B2%E7%BE%85%E3%80%91%E4%BB%8A%E5%B9%B4%E3%81%AEm-1%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%97/","formed_source_type":"二次資料（M-1結成年一覧）","formed_batch":"v157-bulk-year-index","formed_research_status":"UNRESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"ギリギリすれすれ":{"agency":"松竹芸能","agency_key":"松竹芸能","agency_verified":true,"agency_source":"https://www.m-1gp.com/combi/4274.html","agency_source_type":"M-1公式","agency_scope":"M-1公式登録所属","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2016","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/4274.html","formed_source_type":"M-1公式","formed_note":"M-1公式：2016年6月1日結成。","formed_batch":"v207-second-pass","formed_research_status":"RESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"サージェント":{"agency":"複数所属（吉本興業＋フリー）","agency_key":"mixed","agency_verified":true,"agency_source":"https://www.m-1gp.com/combi/26465.html","agency_source_type":"M-1公式","agency_scope":"M-1公式登録所属","affiliation_note":"M-1公式が「プロ（吉本興業/フリー）」と明記。メンバー別所属として管理。","agency_mode":"mixed","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2023","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/26465.html","formed_source_type":"M-1公式","formed_note":"M-1公式：2023年8月31日結成。","formed_batch":"v207-second-pass","formed_research_status":"RESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"ざくろ":{"agency":"アマチュア","agency_key":"アマチュア","agency_verified":true,"agency_source":"https://o-463ki3ki.hatenablog.com/entry/2016/10/21/231713","agency_source_type":"M-1 2016予選記録","agency_scope":"M-1 2016大会登録区分","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2016","formed_verified":false,"formed_source":"https://www.m-1gp.com/","formed_source_type":"DB対象大会年プロキシ（同名照合未完）","formed_note":"DB対象はM-1 2016 3回戦のアマチュア組。2010にも同名アマチュア記録があるが同一組と断定できないため2016年を暫定採用。","formed_batch":"v168-final14","formed_research_status":"UNRESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"サヨナラホームラン":{"agency":"アマチュア","agency_key":"アマチュア","agency_verified":true,"agency_source":"https://news.yoshimoto.co.jp/news2015/2015/03/entry60249.php","agency_source_type":"よしもとニュース／学生芸人大会記録","agency_scope":"M-1 2015大会前後","affiliation_note":"日本大学・駒澤大学の学生芸人として同時期資料で確認。","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2013","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%82%B5%E3%83%A8%E3%83%8A%E3%83%A9%E3%83%9B%E3%83%BC%E3%83%A0%E3%83%A9%E3%83%B3&searchbtn=1","formed_source_type":"M-1公式","formed_note":"M-1公式で2013年4月1日結成。","formed_batch":"v165-rally1","formed_research_status":"RESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"さんてん堂":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://www.m-1gp.com/combi/11424.html","agency_source_type":"M-1公式","agency_scope":"M-1公式登録所属","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2019","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/11424.html","formed_source_type":"M-1公式","formed_note":"M-1公式：2019年12月10日結成。","formed_batch":"v207-second-pass","formed_research_status":"RESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"じぇんば じぇんば":{"agency":"フリー","agency_key":"フリー","agency_verified":true,"agency_source":"https://www.m-1gp.com/combi/2951.html","agency_source_type":"M-1公式","agency_scope":"M-1公式登録所属","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2015","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/2951.html","formed_source_type":"M-1公式","formed_note":"M-1公式：2015年結成。","formed_batch":"v207-second-pass","formed_research_status":"RESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"しおゾウ":{"agency":"アマチュア","agency_key":"アマチュア","agency_verified":true,"agency_source":"https://o-warai.com/?p=8368","agency_source_type":"M-1公式データを用いた大会分析","agency_scope":"M-1 2018大会登録区分","affiliation_note":"2018年二回戦突破アマチュア一覧に掲載。","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2018","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/list.php?page=395","formed_source_type":"M-1公式","formed_note":"結成年を資料で確認","formed_batch":"v158-bulk60","formed_research_status":"RESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"じゃがいもタルト":{"agency":"アマチュア","agency_key":"アマチュア","agency_verified":true,"agency_source":"https://blog.livedoor.jp/the_untouchable/archives/52142476.html","agency_source_type":"M-1 2021現地予選記録","agency_scope":"M-1 2021大会登録区分","affiliation_note":"M-1 2021 3回戦現地記録でアマチュアと明記。","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2014","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%81%98%E3%82%83%E3%81%8C%E3%81%84%E3%82%82%E3%82%BF%E3%83%AB%E3%83%88&searchbtn=1","formed_source_type":"M-1公式","formed_note":"M-1公式で2014年11月28日結成。","formed_batch":"v164-research-continuation","formed_research_status":"RESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"しゅんしゅんクリニックPと循環器内科医":{"agency":"複数所属（吉本興業＋アマチュア）","agency_key":"mixed","agency_verified":true,"agency_source":"https://www.m-1gp.com/archive/2018/schedule/detail.html?id=216","agency_source_type":"M-1公式予選アーカイブ","agency_scope":"M-1 2018大会登録区分","affiliation_note":"M-1公式予選記録が「吉本興業/アマチュア」と明記。ユニット一括所属ではなく複数区分として管理。","agency_mode":"mixed","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2018","formed_verified":true,"formed_source":"https://www.jrcla.or.jp/origin/wp-content/themes/jrcla_wp/web_book/web_book_labo545/pageindices/index7.html","formed_source_type":"日本臨床検査薬協会プロフィール資料","formed_batch":"v141-3lane","formed_research_status":"RESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"シン・ノザワ":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://o-463ki3ki.hatenablog.com/entry/2016/10/29/131104","agency_source_type":"M-1 2016予選記録","agency_scope":"M-1 2016大会登録所属","affiliation_note":"当時表記「よしもとクリエイティブ・エージェンシー」を現行名称へ正規化。","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2016","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/list.php?page=223","formed_source_type":"M-1公式","formed_note":"結成年を資料で確認","formed_batch":"v158-bulk60","formed_research_status":"RESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"スタローン":{"agency":"フリー","agency_key":"フリー","agency_verified":true,"agency_source":"https://www.m-1gp.com/archive/2015/schedule/detail.html?id=8","agency_source_type":"M-1公式予選アーカイブ","agency_scope":"M-1 2015大会登録所属","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2015","formed_verified":true,"formed_source_type":"限定ユニット資料照合","formed_note":"通常の固定コンビではなく2015年2月に組まれた限定ユニット。DBのM-1 2015戦績と一致するため2015年を採用。","formed_batch":"v164-research-continuation","formed_research_status":"RESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"スリーナイン":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://www.m-1gp.com/archive/2010/1003f.htm","agency_source_type":"M-1公式旧大会アーカイブ","agency_scope":"M-1 2010大会当時","affiliation_note":"当時表記「よしもとクリエイティブ・エージェンシー 福岡」を現行名称へ正規化。","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2009","formed_verified":false,"formed_source":"https://thetv.jp/person/2000011309/","formed_source_type":"WEBザテレビジョン","formed_batch":"v147-A","formed_research_status":"UNRESOLVED","activity_status":"dissolved","activity_verified":true,"activity_end":"2018-03-31","activity_source":"https://thetv.jp/person/2000011309/","activity_research_batch":"v205","activity_research_status":"RESOLVED","activity_last_checked":"2026-09-14"},"セイレーン":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://www.m-1gp.com/combi/994.html","agency_source_type":"M-1公式","agency_scope":"M-1公式登録所属","affiliation_note":"M-1公式の清友・kento fukaya組を採用。DB内の2015年結果は結成2017年と整合しないため、戦績側は別途同名・履歴監査対象。","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2017","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/994.html","formed_source_type":"M-1公式","formed_note":"M-1公式：2017年8月1日結成。","formed_batch":"v207-second-pass","formed_research_status":"RESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"チャリンコクラブ":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://www.m-1gp.com/archive/2018/schedule/detail.html?id=205","agency_source_type":"M-1公式予選アーカイブ","agency_scope":"M-1 2018大会登録所属","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2015","formed_verified":false,"formed_source":"https://walive.org/syabekuri_wagei/278/","formed_source_type":"演芸賞公式・最古確認年プロキシ","formed_note":"2015年の第4回関西演芸しゃべくり話芸大賞で準グランプリ・決勝出場を確認。DBのM-1 2018以前の活動が確認できるため2015年を暫定採用。","formed_batch":"v168-final14","formed_research_status":"UNRESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"ちゅんま":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://www.m-1gp.com/archive/2019/schedule/detail.html?id=284","agency_source_type":"M-1公式予選アーカイブ","agency_scope":"M-1 2019大会登録所属","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2017","formed_verified":false,"formed_source":"https://mcwr-1.com/2022/09/26/%E3%80%90%E6%AD%B4%E4%BB%A3%E3%83%A9%E3%82%B9%E3%83%88%E3%82%A4%E3%83%A4%E3%83%BC%E3%81%BE%E3%81%A7%E7%B6%B2%E7%BE%85%E3%80%91%E4%BB%8A%E5%B9%B4%E3%81%AEm-1%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%97/","formed_source_type":"二次資料（M-1結成年一覧）","formed_batch":"v157-bulk-year-index","formed_research_status":"UNRESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"チル":{"agency":"SMA","agency_key":"SMA","agency_verified":true,"agency_source":"https://www.m-1gp.com/schedule/detail.html?id=249","agency_source_type":"M-1公式予選記録","agency_scope":"M-1大会登録所属","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2017","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%83%81%E3%83%AB&searchbtn=1","formed_source_type":"M-1公式","formed_note":"M-1公式コンビ一覧で2017年結成。","formed_batch":"v164-research-continuation","formed_research_status":"RESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"テラリウム":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://www.m-1gp.com/schedule/detail.html?id=314","agency_source_type":"M-1公式予選記録","agency_scope":"M-1大会登録所属","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2018","formed_verified":false,"formed_source":"https://mcwr-1.com/2022/09/26/%E3%80%90%E6%AD%B4%E4%BB%A3%E3%83%A9%E3%82%B9%E3%83%88%E3%82%A4%E3%83%A4%E3%83%BC%E3%81%BE%E3%81%A7%E7%B6%B2%E7%BE%85%E3%80%91%E4%BB%8A%E5%B9%B4%E3%81%AEm-1%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%97/","formed_source_type":"二次資料（M-1結成年一覧）","formed_batch":"v157-bulk-year-index","formed_research_status":"UNRESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"ニュージーズ":{"agency":"アマチュア","agency_key":"アマチュア","agency_verified":true,"agency_source":"https://www.m-1gp.com/archive/2015/schedule/detail.html?id=57","agency_source_type":"M-1公式予選アーカイブ","agency_scope":"M-1 2015大会登録区分","affiliation_note":"2015年M-1当時のアマチュア登録を採用。後年の同名・メンバー個人の所属は流用しない。","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2015","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%83%8B%E3%83%A5%E3%83%BC%E3%82%B8%E3%83%BC%E3%82%BA&searchbtn=1","formed_source_type":"M-1公式","formed_note":"M-1公式で2015年結成。","formed_batch":"v164-research-continuation","formed_research_status":"RESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"ノルウェースウェーデン":{"agency":"FECオフィス","agency_key":"FECオフィス","agency_verified":true,"agency_source":"https://www.m-1gp.com/combi/detail.html?id=431","agency_source_type":"M-1公式","agency_scope":"M-1公式登録所属","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2011","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/detail.html?id=431","formed_source_type":"M-1公式","formed_note":"v207で2015→2011へ訂正。M-1公式：2011年2月1日結成。","formed_batch":"v207-second-pass","formed_research_status":"RESOLVED","activity_status":"dissolved","activity_verified":true,"activity_source":"https://thetv.jp/person/2090010326/","activity_research_batch":"v205","activity_research_status":"RESOLVED","activity_last_checked":"2026-09-14"},"ハニーベージュ":{"agency":"オフィス北野","agency_key":"オフィス北野","agency_verified":true,"agency_source":"https://www.m-1gp.com/combi/109.html","agency_source_type":"M-1公式","agency_scope":"M-1公式登録所属","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2005","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/109.html","formed_source_type":"M-1公式","formed_note":"M-1公式：2005年1月1日結成。","formed_batch":"v207-second-pass","formed_research_status":"RESOLVED","activity_status":"dissolved","activity_verified":true,"activity_end":"2018-10-14","activity_source":"https://thetv.jp/","activity_note":"WEBザテレビジョンの解散記載を二次確認。","activity_research_batch":"v205","activity_research_status":"RESOLVED","activity_last_checked":"2026-09-14"},"パプア。":{"agency":"デリートエンターテイメント","agency_key":"デリートエンターテイメント","agency_verified":true,"agency_source":"https://www.m-1gp.com/archive/2008/1221.htm","agency_source_type":"M-1公式旧大会アーカイブ","agency_scope":"M-1 2008敗者復活戦時","affiliation_note":"2008年序盤にはフリー表記もあるが、対象年後半の公式敗者復活戦でデリートエンターテイメント所属を確認したためこちらを採用。","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2008","formed_verified":false,"formed_source":"https://www.m-1gp.com/history/","formed_source_type":"大会・公的活動の初確認年（暫定）","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。","formed_batch":"v167-rally2","formed_research_status":"UNRESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"ふみつけ大将軍":{"agency":"SMA","agency_key":"SMA","agency_verified":true,"agency_source":"https://www.m-1gp.com/archive/2016/schedule/detail.html?id=121","agency_source_type":"M-1公式予選アーカイブ","agency_scope":"M-1 2016大会登録所属","affiliation_note":"2007年M-1では目黒笑売塾表記も確認できるため、DB対象戦績に近い2016年のSMA登録を採用。","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2008","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/list.php?page=129","formed_source_type":"M-1公式","formed_note":"結成年を資料で確認","formed_batch":"v158-bulk60","formed_research_status":"RESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"ぷらすわん":{"agency":"ラフィーネプロモーション","agency_key":"ラフィーネプロモーション","agency_verified":true,"agency_source":"https://natalie.mu/owarai/news/634399","agency_source_type":"お笑いナタリー","agency_scope":"KOC2023〜解散時","affiliation_note":"2019年5月にオスカー退所後、ラフィーネプロモーション所属。2025年7月31日解散。","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"1998","formed_verified":true,"formed_source":"https://natalie.mu/owarai/news/634399","formed_source_type":"お笑いナタリー","formed_note":"お笑いナタリー：1998年結成。","formed_batch":"v207-second-pass","formed_research_status":"RESOLVED","activity_status":"dissolved","activity_verified":true,"activity_end":"2025-07-31","activity_source":"https://natalie.mu/owarai/news/634399","activity_note":"お笑いナタリーが2025年7月31日の解散を報道。","activity_research_batch":"v207-second-pass","activity_research_status":"RESOLVED","activity_last_checked":"2026-09-14"},"ブラボー":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://www.m-1gp.com/combi/list.php?page=4","agency_source_type":"M-1公式コンビ一覧／予選記録照合","agency_scope":"M-1 2015-2016活動時所属","affiliation_note":"M-1公式コンビ一覧で2016年3回戦進出を同一結成年と照合し、当時予選記録のよしもと表記を採用。","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2011","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/list.php?page=4","formed_source_type":"M-1公式","formed_note":"結成年を資料で確認","formed_batch":"v158-bulk60","formed_research_status":"RESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"フロウフシ":{"agency":"松竹芸能","agency_key":"松竹芸能","agency_verified":true,"agency_source":"https://www.m-1gp.com/archive/2023/schedule/detail.html?id=564","agency_source_type":"M-1公式予選アーカイブ","agency_scope":"M-1大会登録所属","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2020","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%83%95%E3%83%AD%E3%82%A6%E3%83%95%E3%82%B7&searchbtn=1","formed_source_type":"M-1公式","formed_note":"M-1公式で2020年6月結成。","formed_batch":"v164-research-continuation","formed_research_status":"RESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"ボケボケマンボーズ":{"agency":"アマチュア","agency_key":"アマチュア","agency_verified":true,"agency_source":"https://www.m-1gp.com/schedule/detail.html?id=403","agency_source_type":"M-1公式予選記録","agency_scope":"M-1 2021大会登録区分","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2018","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%83%9C%E3%82%B1%E3%83%9C%E3%82%B1%E3%83%9E%E3%83%B3%E3%83%9C%E3%83%BC%E3%82%BA&searchbtn=1","formed_source_type":"M-1公式","formed_note":"M-1公式で2018年結成を確認。","formed_batch":"v165-rally1","formed_research_status":"RESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"ボヘミアン":{"agency":"アマチュア","agency_key":"アマチュア","agency_verified":true,"agency_source":"https://o-warai.com/2021/10/09/%E3%80%90%E3%83%87%E3%83%BC%E3%82%BF%E3%80%9110-9%E6%9B%B4%E6%96%B0-m-1%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%97%E3%83%AA-2021-%E4%BA%8C%E5%9B%9E%E6%88%A6-%E3%83%97%E3%83%AD%E3%83%BB%E3%82%A2%E3%83%9E/","agency_source_type":"M-1公式データを用いた大会分析","agency_scope":"M-1 2017大会登録区分","affiliation_note":"2017年の二回戦突破アマチュアとして確認。2024年結成の同名M-1公式コンビとは別物として扱う。","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2017","formed_verified":false,"formed_source":"https://www.m-1gp.com/","formed_source_type":"DB対象大会年プロキシ（同名多数）","formed_note":"DB対象はM-1 2017 3回戦の組。2005・2007・2009および2024にも同名アマチュア組が存在し、同一性を立証できないためDB対象年2017を暫定採用。","formed_batch":"v168-final14","formed_research_status":"UNRESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"マツモトロビンフットクラブ":{"agency":"SMA","agency_key":"SMA","agency_verified":true,"agency_source":"https://www.m-1gp.com/combi/25995.html","agency_source_type":"M-1公式","agency_scope":"M-1公式登録所属","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2023","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/25995.html","formed_source_type":"M-1公式","formed_note":"M-1公式：2023年8月30日結成。","formed_batch":"v207-second-pass","formed_research_status":"RESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"マドンナ。":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://o-463ki3ki.hatenablog.com/entry/2016/10/29/131104","agency_source_type":"M-1 2016予選記録","agency_scope":"M-1 2016大会登録所属","affiliation_note":"当時表記「よしもとクリエイティブ・エージェンシー」を現行名称へ正規化。","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2011","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/list.php?page=74","formed_source_type":"M-1公式","formed_research_status":"RESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"マラソンズ":{"agency":"アマチュア","agency_key":"アマチュア","agency_verified":true,"agency_source":"https://news.yoshimoto.co.jp/news2015/2015/03/entry60281.php","agency_source_type":"よしもとニュース／KOC公式照合","agency_scope":"KOC 2015大会時","affiliation_note":"日本大学文理学部落語研究会の学生4人組「マラソンズ」として確認。KOC2015準決勝記録と同時期・構成を照合。","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2015","formed_verified":false,"formed_source":"https://archive.king-of-conte.com/","formed_source_type":"大会・公的活動の初確認年（暫定）","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。","formed_batch":"v167-rally2","formed_research_status":"UNRESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"メメ":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://www.m-1gp.com/archive/2009/0906.htm","agency_source_type":"M-1公式旧大会アーカイブ","agency_scope":"M-1 2009大会当時","affiliation_note":"当時表記「よしもとクリエイティブ・エージェンシー 東京」を現行名称へ正規化。","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2009","formed_verified":false,"formed_source":"https://www.m-1gp.com/history/","formed_source_type":"大会・公的活動の初確認年（暫定）","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。","formed_batch":"v167-rally2","formed_research_status":"UNRESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"ロールキャベツ団地":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://www.m-1gp.com/combi/6093.html","agency_source_type":"M-1公式","agency_scope":"M-1公式登録所属","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2017","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/6093.html","formed_source_type":"M-1公式","formed_note":"M-1公式：2017年4月1日結成。","formed_batch":"v207-second-pass","formed_research_status":"RESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"ロマンティックベイベー":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://www.m-1gp.com/combi/14000.html","agency_source_type":"M-1公式","agency_scope":"M-1公式登録所属","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2020","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/14000.html","formed_source_type":"M-1公式","formed_note":"M-1公式：2020年8月30日結成。","formed_batch":"v207-second-pass","formed_research_status":"RESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"ワルステルダム":{"agency":"プロダクション人力舎","agency_key":"プロダクション人力舎","agency_verified":true,"agency_source":"https://www.m-1gp.com/archive/2010/1106.htm","agency_source_type":"M-1公式旧大会アーカイブ","agency_scope":"M-1 2010大会当時","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2008","formed_verified":true,"formed_source_type":"既確認済み（引継ぎ）","formed_batch":"v203","formed_research_status":"RESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"金曜日のロイド":{"agency":"フリー","agency_key":"フリー","agency_verified":true,"agency_source":"https://kaleidoline.jp/teppen/teppen310.htm","agency_source_type":"TEPPEN公式大会記録","agency_scope":"2022年活動時","affiliation_note":"2022年の同一ユニットをフリーとして確認。","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2017","formed_verified":false,"formed_source":"https://mcwr-1.com/2022/09/26/%E3%80%90%E6%AD%B4%E4%BB%A3%E3%83%A9%E3%82%B9%E3%83%88%E3%82%A4%E3%83%A4%E3%83%BC%E3%81%BE%E3%81%A7%E7%B6%B2%E7%BE%85%E3%80%91%E4%BB%8A%E5%B9%B4%E3%81%AEm-1%E3%82%B0%E3%83%A9%E3%83%B3%E3%83%97/","formed_source_type":"二次資料（M-1結成年一覧）","formed_batch":"v157-bulk-year-index","formed_research_status":"UNRESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"銀矢倉":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://www.m-1gp.com/combi/15371.html","agency_source_type":"M-1公式","agency_scope":"M-1公式登録所属","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2021","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/15371.html","formed_source_type":"M-1公式","formed_note":"M-1公式：2021年4月20日結成。","formed_batch":"v207-second-pass","formed_research_status":"RESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"},"高校デビュー":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://www.m-1gp.com/archive/2007/revenge.html","agency_source_type":"M-1公式旧大会アーカイブ","agency_scope":"M-1 2007敗者復活戦時","affiliation_note":"当時表記「よしもとクリエイティブ・エージェンシー 大阪」を現行名称へ正規化。大会序盤のアマチュア表記から所属変更した可能性を注記。","agency_research_batch":"v207-second-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2007","formed_verified":false,"formed_source":"https://www.m-1gp.com/history/","formed_source_type":"大会・公的活動の初確認年（暫定）","formed_note":"結成年そのものを明記した一次資料は未確認。大会公式または公的な活動記録で確認できる最古年を暫定値として登録。確定値が見つかれば置換対象。","formed_batch":"v167-rally2","formed_research_status":"UNRESOLVED","activity_research_batch":"v205","activity_research_status":"UNRESOLVED","activity_last_checked":"2026-09-14"}};
for(const d of DB){
 const p=P[d.name]; if(p) Object.assign(d,p);
 if(d.agency_verified===true)d.agency_research_status="RESOLVED";
 else {d.agency_research_batch="v207-second-pass";d.agency_research_status="UNRESOLVED";d.agency_last_checked="2026-09-14";if(!d.agency_research_note)d.agency_research_note="v207第二巡調査済み。対象時期・構成員に一致する所属を確定できる十分な根拠なし。";}
}
window.M1KOC_CHECKPOINT={version:"v207",base_count:DB.length,focus:"agency second pass + formation audit",second_pass_target:83,newly_resolved:44,agency_verified:DB.filter(d=>d.agency_verified===true).length,agency_unresolved:DB.filter(d=>d.agency_verified!==true).length,agency_unprocessed:0,checked_at:"2026-09-14",remaining_unresolved:["A面","ULTRA SUPER BOYS","アゲアゲボーイズ","アストロNエース","アベコベ山脈","ヴィーナスライン","ガイガジン","ザ・ブギウギトリオ","サトウ","サぺい","サンダーバード","シンエサカ","ジンカーズ","ストロングマン","ソファーズ","たけちゃんせいちゃん","たんぽぽメダル","ともだち","トライデント","ドラッパ","とりはげ","にゅ～くれ～ぷ","ばんどーら","ビッグスリードラゴンズ","フェー","ペーパーダイバー","マエダtoギガ","まゆむら","ヨコチョ","ラージャン","ロズウェル","ロッカーズ","金乳銀乳","劇団かもめんたる","劇団スティック","昨年のMVP","転転飯店","藤井ランド","藤井ンド"]};
})();

/* ---- retained patch boundary ---- */

/* v207 source-verification correction */
(()=>{const P={"ふみつけ大将軍":{"agency_source":"https://o-463ki3ki.hatenablog.com/entry/2016/10/29/131104","agency_source_type":"M-1 2016予選記録"},"ブラボー":{"agency_source":"https://o-463ki3ki.hatenablog.com/entry/2016/10/21/231713","agency_source_type":"M-1 2016予選記録"}};for(const d of DB){if(P[d.name])Object.assign(d,P[d.name]);}})();

/* ---- retained patch boundary ---- */

/* v208 agency third-pass corrections */
(()=>{
const P={"A面":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://www.m-1gp.com/combi/18610.html","agency_source_type":"M-1公式","agency_scope":"M-1公式登録所属","agency_research_batch":"v208-third-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2022","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/18610.html","formed_source_type":"M-1公式","formed_note":"M-1公式：2022年9月1日結成。","formed_batch":"v208-third-pass","formed_research_status":"RESOLVED"},"アゲアゲボーイズ":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://www.m-1gp.com/combi/9208.html","agency_source_type":"M-1公式","agency_scope":"M-1公式登録所属","agency_research_batch":"v208-third-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2018","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/9208.html","formed_source_type":"M-1公式","formed_note":"M-1公式：2018年8月1日結成。","formed_batch":"v208-third-pass","formed_research_status":"RESOLVED"},"アストロNエース":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://www.minnanogo.com/g/_sub_page/-etc/geino/owarai.html","agency_source_type":"旧芸人名鑑（二次）＋KOC公式照合","agency_scope":"KOC2011対象ユニット当時","affiliation_note":"芝山大輔・宮本悠史の同一ユニットをKOC2011公式出場記録と照合。複数の旧芸人名鑑で、よしもとクリエイティブ・エージェンシー所属表記を確認。","agency_research_batch":"v208-third-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14"},"ガイガジン":{"agency":"フリー","agency_key":"フリー","agency_verified":true,"agency_source":"https://natalie.mu/owarai/news/354033","agency_source_type":"お笑いナタリー（大会当時記事）","agency_scope":"KOC2019当時","affiliation_note":"2019年記事で『事務所無所属のフリー芸人として挑んだキングオブコント2019』と明記。","agency_research_batch":"v208-third-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2016","formed_verified":true,"formed_source":"https://natalie.mu/owarai/news/354033","formed_source_type":"お笑いナタリー","formed_note":"2019年記事で2016年結成と明記。","formed_batch":"v208-third-pass","formed_research_status":"RESOLVED"},"サぺい":{"agency":"太田プロダクション","agency_key":"太田プロダクション","agency_verified":true,"agency_source":"https://www.m-1gp.com/combi/23303.html","agency_source_type":"M-1公式","agency_scope":"M-1公式登録所属","agency_research_batch":"v208-third-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2023","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/23303.html","formed_source_type":"M-1公式","formed_note":"M-1公式：2023年6月1日結成。","formed_batch":"v208-third-pass","formed_research_status":"RESOLVED"},"ジンカーズ":{"agency":"フリー","agency_key":"フリー","agency_verified":true,"agency_source":"https://thetv.jp/person/1000041982/","agency_source_type":"WEBザテレビジョン＋当時イベント記録","agency_scope":"KOC2012以降の対象時期","affiliation_note":"2003年結成。2012年2月に所属事務所を離れたことを確認し、KOC2012以降の対象時期はフリーとして整理。","agency_research_batch":"v208-third-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2003","formed_verified":true,"formed_source":"https://thetv.jp/person/1000041982/","formed_source_type":"WEBザテレビジョン","formed_note":"プロフィールで2003年結成を確認。","formed_batch":"v208-third-pass","formed_research_status":"RESOLVED"},"ソファーズ":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://ameblo.jp/mugendai-staff/entry-12503226911.html","agency_source_type":"ヨシモト∞ホール公式ブログ","agency_scope":"KOC2019対象時期","affiliation_note":"ヨシモト∞ホール公式の所属芸人・クラス掲載で同ユニットを確認。","agency_research_batch":"v208-third-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14"},"たけちゃんせいちゃん":{"agency":"複数所属（ケイダッシュステージ＋浅井企画）","agency_key":"mixed","agency_mode":"mixed","agency_verified":true,"agency_source":"https://www.kdashstage.jp/profile/archives/20","agency_source_type":"メンバー各事務所公式＋KOCユニット照合","agency_scope":"KOC2024対象ユニット","affiliation_note":"KOC2024の『たけちゃんせいちゃん』＝どんぐりたけし＋もりせいじゅ。どんぐりたけし＝ケイダッシュステージ、もりせいじゅ＝浅井企画。","agency_research_batch":"v208-third-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14"},"たんぽぽメダル":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://www.king-of-conte.com/2023/schedule/","agency_source_type":"KOCユニット照合＋メンバー所属確認","agency_scope":"KOC2023対象ユニット","affiliation_note":"対象ユニットは真輝志＋ソマオ・ミートボール。両名とも吉本興業所属を各公式プロフィールで確認。","agency_research_batch":"v208-third-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14"},"トライデント":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://archive.king-of-conte.com/2024/","agency_source_type":"KOCユニット照合＋メンバー所属確認","agency_scope":"KOC2024対象ユニット","affiliation_note":"対象ユニットは真輝志＋シゲカズです＋河野良祐。対象時期に3名とも吉本興業所属を確認。","agency_research_batch":"v208-third-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14"},"ばんどーら":{"agency":"マセキ芸能社","agency_key":"マセキ芸能社","agency_verified":true,"agency_source":"https://natalie.mu/owarai/news/329936","agency_source_type":"お笑いナタリー（マセキ所属芸人企画）","agency_scope":"KOC2019対象時期","affiliation_note":"2019年のマセキ所属芸人企画への出演で当時所属を確認。","agency_research_batch":"v208-third-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","activity_status":"dissolved","activity_verified":true,"activity_source":"https://thetv.jp/person/2090004005/","activity_source_type":"WEBザテレビジョン","activity_note":"2020年8月3日解散を確認。","activity_research_batch":"v208-third-pass","activity_research_status":"RESOLVED","activity_last_checked":"2026-09-14"},"フェー":{"agency":"マセキ芸能社","agency_key":"マセキ芸能社","agency_verified":true,"agency_source":"https://www.maseki.co.jp/talent/prof_print/fey_prof.pdf","agency_source_type":"マセキ芸能社公式旧プロフィール","agency_scope":"活動当時","affiliation_note":"マセキ芸能社公式旧プロフィールで所属・メンバーを確認。","agency_research_batch":"v208-third-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","activity_status":"dissolved","activity_verified":true,"activity_source":"https://owaraiouen.com/2020/07/03/2020kaisann/","activity_source_type":"解散記録（マセキ公式発表参照）","activity_note":"2020年8月24日解散を確認。","activity_research_batch":"v208-third-pass","activity_research_status":"RESOLVED","activity_last_checked":"2026-09-14"},"ラージャン":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://www.m-1gp.com/combi/33110.html","agency_source_type":"M-1公式","agency_scope":"M-1公式登録所属","agency_research_batch":"v208-third-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2024","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/33110.html","formed_source_type":"M-1公式","formed_note":"M-1公式：2024年12月2日結成。","formed_batch":"v208-third-pass","formed_research_status":"RESOLVED"},"ロズウェル":{"agency":"ビクターミュージックアーツ","agency_key":"ビクターミュージックアーツ","agency_verified":true,"agency_source":"https://www.m-1gp.com/combi/37392.html","agency_source_type":"M-1公式","agency_scope":"M-1公式登録所属","agency_research_batch":"v208-third-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2025","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/37392.html","formed_source_type":"M-1公式","formed_note":"M-1公式：2025年2月9日結成。","formed_batch":"v208-third-pass","formed_research_status":"RESOLVED"},"ロッカーズ":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://lilacomedy.com/granprix/m12019-3rdround/","agency_source_type":"M-1 2019同時期予選データ（二次）","agency_scope":"M-1 2019対象時期","affiliation_note":"M-1 2019三回戦の同時期データで吉本興業表記を複数照合。","agency_research_batch":"v208-third-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14"},"金乳銀乳":{"agency":"複数所属（ノーリーズン＋フリー）","agency_key":"mixed","agency_mode":"mixed","agency_verified":true,"agency_source":"https://r-1gp.com/archive/2019/r2r.php?num=120","agency_source_type":"R-1公式＋KOCユニット照合","agency_scope":"KOC2019対象時期","affiliation_note":"KOC2019対象ユニット。R-1 2019公式でレオちゃん＝ノーリーズン、金乳銀乳なおと＝フリーを確認。","agency_research_batch":"v208-third-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2016","formed_verified":true,"formed_source":"https://www.m-1gp.com/","formed_source_type":"M-1公式大会記録","formed_note":"M-1公式の出場記録で結成2016年表記を確認。","formed_batch":"v208-third-pass","formed_research_status":"RESOLVED"},"昨年のMVP":{"agency":"ラフィーネプロモーション","agency_key":"ラフィーネプロモーション","agency_verified":true,"agency_source":"https://jtbpublishing.co.jp/topics/CL000564","agency_source_type":"メンバー所属一次資料＋R-1公式照合","agency_scope":"KOC2023対象時期","affiliation_note":"『昨年のMVP』＝堀川ランプ＋そると。2023年当時、堀川ランプはJTBパブリッシング記事、そるとはR-1公式でラフィーネプロモーション所属を確認。","agency_research_batch":"v208-third-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14"}};
for(const d of DB){const p=P[d.name];if(p)Object.assign(d,p);}
const pp=DB.find(d=>d.name==="ペーパーダイバー"||d.name==="ペーパーダイパー");
if(pp){
 const old=pp.name; pp.name="ペーパーダイパー";
 pp.aliases=[...new Set([...(Array.isArray(pp.aliases)?pp.aliases:[]),...(old!=="ペーパーダイパー"?[old]:[]),"ペーパーダイバー"])];
 Object.assign(pp,{"agency":"アマチュア","agency_key":"アマチュア","agency_verified":true,"agency_source":"https://www.m-1gp.com/combi/32630.html","agency_source_type":"M-1公式","agency_scope":"M-1公式登録所属","affiliation_note":"M-1公式表記は『ペーパーダイパー』。旧DB表記『ペーパーダイバー』はaliasとして保持。","agency_research_batch":"v208-third-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2024","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/32630.html","formed_source_type":"M-1公式","formed_note":"M-1公式：2024年8月21日結成。","formed_batch":"v208-third-pass","formed_research_status":"RESOLVED"});
}
const remaining=["ULTRA SUPER BOYS","アベコベ山脈","ヴィーナスライン","ザ・ブギウギトリオ","サトウ","サンダーバード","シンエサカ","ストロングマン","ともだち","ドラッパ","とりはげ","にゅ～くれ～ぷ","ビッグスリードラゴンズ","マエダtoギガ","まゆむら","ヨコチョ","劇団かもめんたる","劇団スティック","転転飯店","藤井ランド","藤井ンド"];
for(const d of DB){
 if(remaining.includes(d.name)){
  d.agency_research_batch="v208-third-pass";d.agency_research_status="UNRESOLVED";d.agency_last_checked="2026-09-14";
  d.agency_research_note="v208第三巡調査済み。旧大会記録・構成員単位・所属時期を再照合したが、対象時期・構成員に一致する所属を確定できる十分な根拠なし。";
 }
 if(d.agency_verified===true)d.agency_research_status="RESOLVED";
}
window.M1KOC_CHECKPOINT={version:"v208",base_count:DB.length,focus:"agency third pass + identity/formation audit",third_pass_target:39,newly_resolved:18,agency_verified:DB.filter(d=>d.agency_verified===true).length,agency_unresolved:DB.filter(d=>d.agency_verified!==true).length,agency_unprocessed:0,checked_at:"2026-09-14",remaining_unresolved:remaining};
})();

/* ---- retained patch boundary ---- */

/* v209 agency fourth-pass corrections */
(()=>{
const P={
"アベコベ山脈":{"agency":"サンミュージックプロダクション","agency_key":"サンミュージックプロダクション","agency_verified":true,"agency_source":"https://kaleidoline.jp/teppen/result/2025/teppen350.htm","agency_source_type":"TEPPEN出演者所属表記＋M-1戦績照合","agency_scope":"M-1 2024直後・2025年1月活動時","affiliation_note":"TEPPEN.350で『アベコベ山脈／サンミュージックプロダクション／M-1グランプリ2024 3回戦進出』と一体で掲載。同名別組の混同を避けて対象組を照合。","agency_research_batch":"v209-fourth-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14"},
"サトウ":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://www.m-1gp.com/combi/9905.html","agency_source_type":"M-1公式","agency_scope":"M-1公式登録所属","affiliation_note":"M-1公式で、かつみあきら＋正田展之の『サトウ』を吉本興業所属として確認。","agency_research_batch":"v209-fourth-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2019","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/9905.html","formed_source_type":"M-1公式","formed_note":"M-1公式：2019年4月1日結成。","formed_batch":"v209-fourth-pass","formed_research_status":"RESOLVED"},
"ストロングマン":{"agency":"ワタナベエンターテインメント","agency_key":"ワタナベエンターテインメント","agency_verified":true,"agency_source":"https://www.watanabepro.co.jp/liveinfo/12210/","agency_source_type":"ワタナベエンターテインメント公式","agency_scope":"M-1 2021対象時期","affiliation_note":"ワタナベ公式WEL FES 2021の『ワタナベ芸人』出演枠にストロングマンを確認。ヤマト＋大崎のM-1 2021ユニットと同一性を同時期記事で照合。","agency_research_batch":"v209-fourth-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14"},
"ともだち":{"agency":"スパンキープロダクション","agency_key":"スパンキープロダクション","agency_verified":true,"agency_source":"https://spunky-pro.com/talent/osaka/564.html","agency_source_type":"所属事務所公式","agency_scope":"現行公式プロフィール＋M-1対象組照合","affiliation_note":"スパンキープロダクション公式で、ちば＋きたがわの『ともだち』を大阪所属タレントとして掲載。M-1対象組の千葉司＋北川裕人と照合。","agency_research_batch":"v209-fourth-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2015","formed_verified":true,"formed_source":"https://spunky-pro.com/talent/osaka/564.html","formed_source_type":"所属事務所公式","formed_note":"公式プロフィール：2015年10月コンビ結成。","formed_batch":"v209-fourth-pass","formed_research_status":"RESOLVED"},
"ドラッパ":{"agency":"アマチュア","agency_key":"アマチュア","agency_verified":true,"agency_source":"https://www.m-1gp.com/archive/2009/1011t.htm","agency_source_type":"M-1 2009公式アーカイブ","agency_scope":"M-1 2009大会登録区分（結成当初）","affiliation_note":"M-1 2009公式で『ドラッパ（アマチュア）』と明記。後年NSC入学・プロ活動したため、DBでは大会当時の所属区分として管理。","agency_research_batch":"v209-fourth-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","activity_status":"dissolved","activity_verified":true,"activity_source":"https://natalie.mu/owarai/news/177090","activity_source_type":"お笑いナタリー","activity_note":"2016年2月29日をもって無期限活動休止。WEBザテレビジョンでは解散扱い。DBの表示上はdissolvedとし、注記に原表現を保持。","activity_research_batch":"v209-fourth-pass","activity_research_status":"RESOLVED","activity_last_checked":"2026-09-14"},
"とりはげ":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%81%A8%E3%82%8A%E3%81%AF%E3%81%92&searchbtn=1","agency_source_type":"M-1公式","agency_scope":"M-1 2017登録所属","affiliation_note":"M-1公式で舟生＋古賀の『とりはげ』、2017年結成、吉本興業所属を確認。","agency_research_batch":"v209-fourth-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2017","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/list.php?search_name=%E3%81%A8%E3%82%8A%E3%81%AF%E3%81%92&searchbtn=1","formed_source_type":"M-1公式","formed_note":"M-1公式で2017年結成を確認。","formed_batch":"v209-fourth-pass","formed_research_status":"RESOLVED"},
"にゅ～くれ～ぷ":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://r-1gp.com/archive/2010/0126.htm","agency_source_type":"R-1 2010公式＋本人回想＋KOC対象組照合","agency_scope":"KOC2010対象・ポラロイドマガジン時代","affiliation_note":"KOC2010対象は2008年結成の旧トリオ。本人回想で2010年頃『大阪よしもと所属』『ポラロイドマガジン』として活動と確認し、R-1 2010公式でもメンバーをよしもとクリエイティブ・エージェンシー大阪所属として確認。2016年以降の浅井企画情報は流用しない。","agency_research_batch":"v209-fourth-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14"},
"ビッグスリードラゴンズ":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://www.m-1gp.com/combi/34405.html","agency_source_type":"M-1公式","agency_scope":"M-1公式登録所属","affiliation_note":"M-1公式でカワゾエ＋中村よしかず＋廣田ゴルチエさんの3人組を吉本興業所属として確認。KOC2025対象ユニットと一致。","agency_research_batch":"v209-fourth-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14","formed":"2025","formed_verified":true,"formed_source":"https://www.m-1gp.com/combi/34405.html","formed_source_type":"M-1公式","formed_note":"M-1公式：2025年7月1日結成。","formed_batch":"v209-fourth-pass","formed_research_status":"RESOLVED"},
"マエダtoギガ":{"agency":"JCAプロモーション","agency_key":"JCAプロモーション","agency_verified":true,"agency_source":"https://www.m-1gp.com/combi/detail.html?id=764","agency_source_type":"M-1 2015公式＋人力舎公式当時記録","agency_scope":"M-1 2015対象時期","affiliation_note":"M-1 2015公式・プロダクション人力舎当時告知で『マエダtoギガ（JCAプロモーション）』を確認。リョウマエダ＋肉体戦士ギガの対象組と一致。","agency_research_batch":"v209-fourth-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14"},
"まゆむら":{"agency":"プロダクション人力舎","agency_key":"プロダクション人力舎","agency_verified":true,"agency_source":"https://www.p-jinriki.com/news/2025/08/006852.php","agency_source_type":"プロダクション人力舎公式","agency_scope":"KOC2025対象時期","affiliation_note":"人力舎公式のKOC2025進出告知で『まゆむら（細野×竹内×りゅうせい）』を1回戦から準々決勝まで掲載。同社公式ライブにも同メンバーで継続掲載。","agency_research_batch":"v209-fourth-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14"},
"ヨコチョ":{"agency":"吉本興業","agency_key":"吉本興業","agency_verified":true,"agency_source":"https://sukejuru.diary2.nazca.co.jp/","agency_source_type":"2015年同時期ライブ出演表＋M-1公式照合","agency_scope":"M-1 2015対象時期","affiliation_note":"2015年同時期の出演表で『ヨコチョ（よしもとクリエイティブ・エージェンシー）』と掲載。M-1 2015公式の同名3回戦組（横澤夏子を含む）と照合。現在の別名・類似名称へは流用しない。","agency_research_batch":"v209-fourth-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14"},
"藤井ランド":{"agency":"SHUプロモーション","agency_key":"SHUプロモーション","agency_verified":true,"agency_source":"https://r-1gp.com/archive/2017/r2r.php?num=121","agency_source_type":"2021年ユニット告知＋KOC公式＋構成員R-1公式照合","agency_scope":"KOC2021対象時期","affiliation_note":"2021年告知で『つむぎ麦＋小松ランドのスペシャルユニット 藤井ランド（SHUプロモーション）』と確認。KOC2021準々決勝記録と、小松ランドのSHUプロモーション所属をR-1公式で照合。後年のフリー表記は対象時期へ遡及させない。","agency_research_batch":"v209-fourth-pass","agency_research_status":"RESOLVED","agency_last_checked":"2026-09-14"}
};
for(const d of DB){const p=P[d.name];if(p)Object.assign(d,p);}
const stick=DB.find(d=>d.name==="劇団スティック");
if(stick)Object.assign(stick,{"activity_status":"active","activity_verified":true,"activity_source":"https://t.pia.jp/pia/event/event.do?eventCd=2600874","activity_source_type":"チケットぴあ","activity_note":"2026年2月26-27日に第4回公演『フルエ・イン・ザン』を開催。ユニット所属は構成員が多様なためUNRESOLVEDのまま。","activity_research_batch":"v209-fourth-pass","activity_research_status":"RESOLVED","activity_last_checked":"2026-09-14","formed":"2021","formed_verified":true,"formed_source":"https://getnavi.jp/entertainment/908902/","formed_source_type":"インタビュー記事","formed_note":"塙宣之インタビューで2021年9月6日立ち上げと明記。","formed_batch":"v209-fourth-pass","formed_research_status":"RESOLVED"});
const remaining=["ULTRA SUPER BOYS","ヴィーナスライン","ザ・ブギウギトリオ","サンダーバード","シンエサカ","劇団かもめんたる","劇団スティック","転転飯店","藤井ンド"];
const notes={
"ULTRA SUPER BOYS":"金澤TKCファクトリー＝ホリプロコム、こば小林＝2023年末R-1公式で無所属までは確認。KOC2023準々決勝（8月）当日のこば小林の所属時点を一次資料で固定できないため、mixed確定は保留。",
"ヴィーナスライン":"KOC2021準々決勝と東海大学お笑いサークル卒業生・野口聖音の参加までは確認。対象ユニット固有の所属を確定できず。",
"ザ・ブギウギトリオ":"KOC2024期と2025年以降で構成員変更が確認され、現在のSMA表記をKOC2024対象ユニットへ遡及させない。",
"サンダーバード":"DB対象は2016年結成。現行浅井企画系同名コンビは2023年結成で別物の可能性が高く、所属を流用しない。",
"シンエサカ":"KOC2025対象組と、2026年7月結成・松竹芸能所属の現行同名コンビで構成／結成時期が異なるため、現行所属を2025組へ流用しない。",
"劇団かもめんたる":"サンミュージックの制作関与と2026年活動は確認済み。構成員の個別所属が複数で、劇団全体の単一所属を確定できない。",
"劇団スティック":"2021年結成・2026年第4回公演まで活動確認。塙主宰の劇団で劇団員の属性・所属が多様なため、劇団全体の芸能事務所所属は確定しない。",
"転転飯店":"2023年旗揚げ・2026年活動まで確認済み。俳優・作家を含むコントユニットで、ユニット固有の芸能事務所所属を確認できない。",
"藤井ンド":"KOC2021準々決勝進出は確認。構成員同定とユニット固有所属を一次・同時期資料で確定できない。"
};
for(const d of DB){
 if(remaining.includes(d.name)){
  d.agency_research_batch="v209-fourth-pass";d.agency_research_status="UNRESOLVED";d.agency_last_checked="2026-09-14";d.agency_research_note=notes[d.name]||"v209第四巡調査済み。対象時期・構成員に一致する所属を確定できる十分な根拠なし。";
 }
 if(d.agency_verified===true)d.agency_research_status="RESOLVED";
}
window.M1KOC_CHECKPOINT={version:"v209",base_count:DB.length,focus:"agency fourth pass + identity/time-scope audit",fourth_pass_target:21,newly_resolved:12,agency_verified:DB.filter(d=>d.agency_verified===true).length,agency_unresolved:DB.filter(d=>d.agency_verified!==true).length,agency_unprocessed:0,checked_at:"2026-09-14",remaining_unresolved:remaining};
})();

/* ---- retained patch boundary ---- */

/* v210 agency fifth-pass + Fujii Land identity dedupe */
(()=>{
const checkedAt="2026-09-14";

// 1) KOC2021 identity audit: "藤井ンド" appears only on the QF schedule,
// while the official advancement announcement and other contemporaneous lists use "藤井ランド".
// Treat it as an official-page spelling error/variant rather than a separate unit.
const fujiiLand=DB.find(d=>d.name==="藤井ランド");
const fujiiNdoIndex=DB.findIndex(d=>d.name==="藤井ンド");
if(fujiiLand && fujiiNdoIndex>=0){
  fujiiLand.aliases=Array.from(new Set([...(fujiiLand.aliases||[]),"藤井ンド"]));
  fujiiLand.identity_verified=true;
  fujiiLand.identity_source="https://archive.king-of-conte.com/2021/2021/07/post-7.html";
  fujiiLand.identity_source_type="KOC2021公式進出者発表＋準々決勝日程照合";
  fujiiLand.identity_note="KOC2021公式の準々決勝進出者発表では『藤井ランド』。準々決勝日程の一箇所のみ『藤井ンド』表記のため、同一ユニットの公式表記揺れ／誤記として統合。旧表記はalias保持。";
  fujiiLand.identity_research_batch="v210-fifth-pass";
  DB.splice(fujiiNdoIndex,1);
}

// 2) Fifth-pass agency resolutions.
const P={
"ザ・ブギウギトリオ":{
  agency:"SMA",agency_key:"SMA",agency_verified:true,
  agency_source:"https://ameblo.jp/heet-info/entry-12855473136.html",
  agency_source_type:"SMA HEET PROJECT公式ブログ＋KOC2024公式照合",
  agency_scope:"KOC2024直前のSMA HEET PROJECT活動時",
  affiliation_note:"2024年6月のSMA HEET PROJECT公式ライブで出演・MCを確認し、同年KOC準々決勝進出の初代トリオと時期を照合。KOC後にメンバー交代があるため、編成変更は注記して同一活動母体として管理。",
  agency_research_batch:"v210-fifth-pass",agency_research_status:"RESOLVED",agency_last_checked:checkedAt,
  activity_status:"active",activity_verified:true,
  activity_source:"https://ameblo.jp/heet-info/entry-12972489492.html",
  activity_source_type:"SMA HEET PROJECT公式ブログ",
  activity_note:"2026年のSMAイディオットライブで継続出演を確認。KOC2024後にメンバー交代あり。",
  activity_research_batch:"v210-fifth-pass",activity_research_status:"RESOLVED",activity_last_checked:checkedAt,
  recent_activity_year:2026,recent_activity_verified:true
},
"サンダーバード":{
  agency:"浅井企画",agency_key:"浅井企画",agency_verified:true,
  agency_source:"https://note.com/oozora1102/n/nd90696768d06",
  agency_source_type:"浅井企画所属芸人本人記録＋浅井企画公式ライブ",
  agency_scope:"2023年9月までに浅井企画所属を確認（KOC2023当日の所属日は未確定）",
  affiliation_note:"浅井企画公式の2023年6月ライブ記事では『現在はフリー』、2023年9月の浅井企画所属芸人の日記では『浅井企画後輩のサンダーバード』と記載。KOC2023（8月）前後の移行期のため大会当日の所属日は断定しないが、2023年中の浅井企画所属歴は確認済み。2026年の浅井企画現行タレント一覧には見当たらず、現所属としては扱わない。",
  agency_research_batch:"v210-fifth-pass",agency_research_status:"RESOLVED",agency_last_checked:checkedAt,
  formed:"2023",formed_verified:true,
  formed_source:"https://asaikikaku.co.jp/news/live/26335.html",
  formed_source_type:"浅井企画公式ライブレポート",
  formed_note:"2023年6月時点で『活動開始からまだ5か月ほど』と明記されており、KOC2023対象組は2023年始動と確定。v209まで参照していた2016年結成のM-1同名組は別ユニットとして分離。",
  formed_batch:"v210-fifth-pass",formed_research_status:"RESOLVED",
  identity_verified:true,
  identity_source:"https://asaikikaku.co.jp/news/live/26335.html",
  identity_source_type:"浅井企画公式＋KOC2023時期照合",
  identity_note:"DBのKOC2023対象は2023年始動の若手コンビ。2016年結成のM-1同名『サンダーバード』とは別組。"
},
"シンエサカ":{
  agency:"松竹芸能",agency_key:"松竹芸能",agency_verified:true,
  agency_source:"https://www.m-1gp.com/combi/list.php?search_name=%E3%82%B7%E3%83%B3%E3%82%A8%E3%82%B5%E3%82%AB&searchbtn=1",
  agency_source_type:"M-1公式現行プロフィール＋2025年メンバー所属照合",
  agency_scope:"KOC2025対象時期〜現行（両メンバー松竹芸能系）",
  affiliation_note:"KOC2025対象は小林シャネル＋あしだみづき。の同メンバー。現行M-1公式ではシンエサカを松竹芸能所属として掲載。2025年時点でも両名の松竹芸能所属を個別資料で確認できるため、同名別組ではなく同メンバーの再編／正式登録と判断。",
  agency_research_batch:"v210-fifth-pass",agency_research_status:"RESOLVED",agency_last_checked:checkedAt,
  formed:"2025",formed_verified:false,
  formed_source:"https://king-of-conte.com/",
  formed_source_type:"KOC2025公式＋M-1 2026公式照合",
  formed_note:"同メンバーでKOC2025準々決勝まで活動しているため最古確認年2025を維持。現行M-1公式は2026年7月1日結成とするため、これは再結成／正式コンビ登録日とみなし、初活動年とは分離して注記。",
  formed_batch:"v210-fifth-pass",formed_research_status:"UNRESOLVED"
}
};
for(const d of DB){const p=P[d.name];if(p)Object.assign(d,p);}

// 3) Fifth pass completed but still not enough evidence for a formal unit agency.
const remaining=["ULTRA SUPER BOYS","ヴィーナスライン","劇団かもめんたる","劇団スティック","転転飯店"];
const notes={
"ULTRA SUPER BOYS":"金澤TKCファクトリー＝ホリプロコムは確認。こば小林は2022年R-1時点で浅井企画、2023年末R-1時点で無所属まで追えたが、KOC2023準々決勝（8月）当日の退所時点を固定できない。mixed所属を推測確定せずUNRESOLVED維持。",
"ヴィーナスライン":"KOC2021準々決勝と東海大学系お笑いサークル出身・野口聖音の参加までは確認。対象ユニット全構成員と大会当時の正式所属区分を確定できないためUNRESOLVED維持。",
"劇団かもめんたる":"2026年公演で『企画・制作・主催＝サンミュージックプロダクション／劇団かもめんたる』を確認。ただし制作・主催関与は劇団全体の芸能事務所所属と同義ではなく、協力欄にも複数事務所が並ぶため単一所属に変換しない。",
"劇団スティック":"2021年旗揚げ、2026年第4回公演まで活動確認済み。塙宣之主宰だが劇団員は多様で、劇団そのものの単一芸能事務所所属を示す資料がないためUNRESOLVED維持。",
"転転飯店":"公式に平山犬＋中村亮太中心のコントユニット、各公演の主催・企画制作＝転転飯店まで確認。自己主催であることを『フリー』という芸能所属へ自動変換せずUNRESOLVED維持。"
};
for(const d of DB){
  if(remaining.includes(d.name)){
    d.agency_research_batch="v210-fifth-pass";
    d.agency_research_status="UNRESOLVED";
    d.agency_last_checked=checkedAt;
    d.agency_research_note=notes[d.name];
  }
  if(d.agency_verified===true)d.agency_research_status="RESOLVED";
}

// Refresh visible totals after the identity merge.
const hero=document.getElementById("heroCount");if(hero)hero.textContent=DB.length.toLocaleString("ja-JP");
const sAll=document.getElementById("sAll");if(sAll)sAll.textContent=DB.length;
const dqSub=document.querySelector(".dq-sub");if(dqSub)dqSub.textContent=`全${DB.length.toLocaleString("ja-JP")}組の未確定項目を実データから自動集計`;

window.M1KOC_CHECKPOINT={
  version:"v210",
  base_count:DB.length,
  focus:"agency fifth pass + KOC2021 identity dedupe",
  fifth_pass_target:9,
  newly_resolved:3,
  deduplicated_records:1,
  dedupe:"藤井ンド→藤井ランド（alias保持）",
  agency_verified:DB.filter(d=>d.agency_verified===true).length,
  agency_unresolved:DB.filter(d=>d.agency_verified!==true).length,
  agency_unprocessed:0,
  checked_at:checkedAt,
  remaining_unresolved:remaining
};
if(typeof render==="function")render();
})();

/* ---- retained patch boundary ---- */

/* v213 public audit: merge KOC2017 official spelling variant into canonical 夜ふかしの会 */
(()=>{
  const canonical=DB.find(d=>d.name==='夜ふかしの会');
  const typoIndex=DB.findIndex(d=>d.name==='夜更かしの会');
  if(canonical&&typoIndex>=0){
    const variant=DB[typoIndex];
    canonical.koc={...(canonical.koc||{}),...(variant.koc||{})};
    const aliases=[...(canonical.aliases||[]),'夜更かしの会',...(variant.aliases||[])];
    canonical.aliases=[...new Set(aliases.filter(a=>a&&normName(a)!==normName(canonical.name)))];
    canonical.identity_verified=true;
    canonical.identity_source='https://archive.king-of-conte.com/2017/2017/05/302.html';
    canonical.identity_note='KOC2017公式日程の「夜更かしの会」は、同日の出演記録と公式サイトの構成員・活動継続を照合し、「夜ふかしの会」の公式表記揺れとして統合。';
    canonical.identity_research_batch='v213-public-audit';
    canonical.data_note=[canonical.data_note,'KOC2017準々決勝の日程表では「夜更かしの会」と表記。公式表記揺れとしてalias統合。'].filter(Boolean).join(' / ');
    DB.splice(typoIndex,1);
  }
})();

/* ---- retained patch boundary ---- */

/* v211 final structural audit + agency contest power */
(()=>{
const checkedAt="2026-09-14";

// --- FINAL IDENTITY / FORMATION AUDIT CORRECTIONS ---
// Kisaragi collision: Watanabe's キサラギ (2010) and Yoshimoto's きさらぎ (2018) are distinct teams.
const kis=DB.find(d=>d.name==="キサラギ");
if(kis){
  kis.m1={};
  kis.koc={"2013":"準決勝","2022":"準々決勝"};
  kis.formed="2010";kis.formed_verified=true;
  kis.formed_source="https://natalie.mu/owarai/news/495772";kis.formed_source_type="お笑いナタリー（解散記事・結成年明記）";
  kis.formed_note="上野悠介＋富樫啓郎。2010年結成のワタナベエンターテインメント所属コンビ。M-1 2018の『きさらぎ』（優＋湯面）とは別ユニット。";
  kis.formed_research_status="RESOLVED";
  kis.agency="ワタナベエンターテインメント";kis.agency_key="ワタナベエンターテインメント";kis.agency_verified=true;
  kis.agency_source="https://natalie.mu/owarai/artist/11258";kis.agency_source_type="お笑いナタリー（プロフィール）";kis.agency_scope="活動当時所属";kis.agency_research_status="RESOLVED";
  kis.activity_status="dissolved";kis.activity_verified=true;kis.activity_source="https://natalie.mu/owarai/news/495772";kis.activity_source_type="お笑いナタリー";kis.activity_note="2022年9月30日解散。";kis.activity_research_status="RESOLVED";
  kis.identity_verified=true;kis.identity_note="同音異表記の吉本『きさらぎ』とはメンバー・結成年・所属が異なるため分離。";
}
if(!DB.some(d=>d.name==="きさらぎ")){
  DB.push({
    name:"きさらぎ",formed:"2018",m1:{"2018":"3回戦"},koc:{},aliases:[],m1_seed_2026:false,
    m1_search:"https://www.m-1gp.com/combi/list.php?search_name=%E3%81%8D%E3%81%95%E3%82%89%E3%81%8E&searchbtn=1",
    wiki:"https://ja.wikipedia.org/wiki/Special:Search?search=%E3%81%8D%E3%81%95%E3%82%89%E3%81%8E",koc_url:"https://king-of-conte.com/",
    formed_verified:true,formed_source:"https://www.m-1gp.com/combi/11495.html",formed_source_type:"M-1公式",formed_note:"優＋湯面。2018年11月1日結成。ワタナベの『キサラギ』とは別ユニット。",formed_research_status:"RESOLVED",
    agency:"吉本興業",agency_key:"吉本興業",agency_verified:true,agency_source:"https://www.m-1gp.com/combi/11495.html",agency_source_type:"M-1公式",agency_scope:"M-1公式登録所属",agency_research_status:"RESOLVED",
    identity_verified:true,identity_note:"同音の『キサラギ』（上野悠介＋富樫啓郎）と分離。"
  });
}

// KOC2011 大黒天 is the 2011-formed Maseki duo; the prior 2020 formation source was a same-name collision.
const dk=DB.find(d=>d.name==="大黒天");
if(dk){
  Object.assign(dk,{formed:"2011",formed_verified:true,formed_source:"https://natalie.mu/owarai/news/187304",formed_source_type:"お笑いナタリー",formed_note:"しょうへい＋大河内敦揮。2011年大阪で結成。2020年結成の同名別コンビ情報は除外。",formed_research_status:"RESOLVED",agency:"マセキ芸能社",agency_key:"マセキ芸能社",agency_verified:true,agency_source:"https://natalie.mu/owarai/artist/86133",agency_source_type:"お笑いナタリー（プロフィール）",agency_scope:"活動当時・最終所属",agency_research_status:"RESOLVED",activity_status:"dissolved",activity_verified:true,activity_source:"https://natalie.mu/owarai/news/187304",activity_source_type:"お笑いナタリー",activity_note:"2016年5月16日解散。",activity_research_status:"RESOLVED",identity_verified:true,identity_note:"KOC2011準決勝組（しょうへい＋大河内敦揮）として再同定。"});
}

// Same-unit appearances before the formal formation/re-formation date: keep official formation, explain chronology.
const ana=DB.find(d=>d.name==="アナクロニスティック");if(ana){ana.preformation_activity_year=2014;ana.preformation_activity_verified=true;ana.formed_note="M-1公式の正式結成日は2015年5月1日。一方、同メンバーがスクールJCA在籍中の2014年KOC準決勝に『アナクロニスティック』として出場しており、養成所在籍時の先行ユニット活動として区別。";}
const sei=DB.find(d=>d.name==="セイレーン");if(sei){sei.preformation_activity_year=2015;sei.preformation_activity_verified=true;sei.formed_note="M-1公式の正式結成日は2017年8月1日。同メンバー（清友＋kento fukaya）は2015年にも同名ユニットでM-1 3回戦まで進出しており、正式結成前のユニット活動として保持。";}
const ber=DB.find(d=>d.name==="ベルナルド");if(ber){ber.preformation_activity_year=2024;ber.preformation_activity_verified=true;ber.formed_verified=true;ber.formed_note="正式結成は2025年1月3日。TBSインタビューで、前年2024年は同メンバーのユニットとしてKOC準々決勝に出場したことを確認。";ber.formed_research_status="RESOLVED";}
const wwd=DB.find(d=>d.name==="ワチュワナドゥ");if(wwd){wwd.formed="2008";wwd.formed_verified=true;wwd.formed_source="https://www.higashimura15.com/blank-23";wwd.formed_source_type="東村プロダクション公式プロフィール＋活動履歴照合";wwd.aliases=Array.from(new Set([...(wwd.aliases||[]),"ザ・アンモナイト"]));wwd.formed_note="2008年10月に『ザ・アンモナイト』として結成、2011年解散、2016年再結成、2018年に『ワチュワナドゥ』へ改名。M-1公式の2016年は再結成年として扱う。";wwd.formed_research_status="RESOLVED";}

// --- STRUCTURAL AUDIT ---
const normAudit=x=>(x||"").normalize("NFKC").replace(/[\s・･]/g,"").toLowerCase();
const auditIssues={duplicates:[],alias_collision:[],stage:[],year:[],chronology:[]};
const can=new Map();DB.forEach((d,i)=>{const k=normAudit(d.name);if(can.has(k))auditIssues.duplicates.push([can.get(k).name,d.name]);else can.set(k,{i,name:d.name});});
const amap=new Map();DB.forEach((d,i)=>{for(const a of d.aliases||[]){const k=normAudit(a);if(can.has(k)&&can.get(k).i!==i)auditIssues.alias_collision.push([d.name,a,can.get(k).name]);if(amap.has(k)&&amap.get(k)!==d.name)auditIssues.alias_collision.push([amap.get(k),a,d.name]);else amap.set(k,d.name);}});
for(const d of DB){
  for(const [c,o] of [["m1",d.m1||{}],["koc",d.koc||{}]])for(const [y,r] of Object.entries(o)){
    if(!/^(3回戦|３回戦|準々決勝|準決勝|決勝|優勝)/.test(String(r)))auditIssues.stage.push([d.name,c,y,r]);
    const yy=Number(y);if(c==="m1"&&!((yy>=2001&&yy<=2010)||(yy>=2015&&yy<=2026)))auditIssues.year.push([d.name,c,y]);if(c==="koc"&&!(yy>=2008&&yy<=2026))auditIssues.year.push([d.name,c,y]);
  }
  const ys=[...Object.keys(d.m1||{}),...Object.keys(d.koc||{})].map(Number).filter(Boolean);const first=ys.length?Math.min(...ys):null,fy=Number(d.formed);
  if(first&&fy&&fy>first&&!d.preformation_activity_verified)auditIssues.chronology.push([d.name,fy,first]);
}
const structuralCount=Object.values(auditIssues).reduce((n,a)=>n+a.length,0);
window.M1KOC_FINAL_AUDIT={version:"v211",checked_at:checkedAt,total:DB.length,agency_verified:DB.filter(d=>d.agency_verified===true).length,agency_unresolved:DB.filter(d=>d.agency_verified!==true).map(d=>d.name),formed_provisional:DB.filter(d=>!d.formed||d.formed_verified===false||d.formed_research_status==="UNRESOLVED").length,structural_issues:structuralCount,issues:auditIssues,identity_fixes:["キサラギ／きさらぎ分離","大黒天KOC2011同定修正","ワチュワナドゥ旧名・再結成年整理"],explained_preformation:["アナクロニスティック 2014→正式2015","セイレーン 2015→正式2017","ベルナルド 2024ユニット→正式2025"]};

// --- AGENCY POWER ---
const agencyType=(m,k)=>{const t=m+k;if(!t)return{label:"—",cls:"dual"};const s=m/t;if(s>=.75)return{label:"漫才特化",cls:"m1"};if(s>=.60)return{label:"漫才寄り",cls:"m1"};if(s<=.25)return{label:"コント特化",cls:"koc"};if(s<.40)return{label:"コント寄り",cls:"koc"};return{label:"二刀流",cls:"dual"};};
const agencyCanonical=d=>{let k=d.agency_key||d.agency||"";if(k==="mixed")return"複数所属";if(k==="サンミュージック")return"サンミュージックプロダクション";if(k==="SMA NEET PROJECT")return"SMA";return k};
renderAgencyDashboard=function(filtered){
  const verified=filtered.filter(d=>d.agency_verified&&d.agency),by=new Map();
  for(const d of verified){const k=agencyCanonical(d);if(!by.has(k))by.set(k,[]);by.get(k).push(d)}
  const mAll=verified.reduce((s,d)=>s+scoreStats(d).m1,0),kAll=verified.reduce((s,d)=>s+scoreStats(d).koc,0);
  const rows=[...by.entries()].map(([agency,ds])=>{
    const m1=ds.reduce((s,d)=>s+scoreStats(d).m1,0),koc=ds.reduce((s,d)=>s+scoreStats(d).koc,0),power=m1+koc;
    const apps=ds.reduce((s,d)=>s+scoreStats(d).appearances,0),avg=ds.length?power/ds.length:0,type=agencyType(m1,koc);
    const mf=ds.reduce((s,d)=>s+periodEntries(d.m1).filter(([,r])=>rank(r)>=90).length,0),kf=ds.reduce((s,d)=>s+periodEntries(d.koc).filter(([,r])=>rank(r)>=90).length,0);
    const mw=ds.reduce((s,d)=>s+periodEntries(d.m1).filter(([,r])=>stageKey(r)==="win").length,0),kw=ds.reduce((s,d)=>s+periodEntries(d.koc).filter(([,r])=>stageKey(r)==="win").length,0);
    return{agency,n:ds.length,m1,koc,power,avg,apps,type,mShare:mAll?m1/mAll*100:0,kShare:kAll?koc/kAll*100:0,mf,kf,mw,kw};
  }).filter(r=>r.power>0).sort((a,b)=>b.power-a.power||b.n-a.n);
  const topM=[...rows].sort((a,b)=>b.m1-a.m1)[0],topK=[...rows].sort((a,b)=>b.koc-a.koc)[0],max=Math.max(1,...rows.map(r=>r.power));
  const dissolved=filtered.filter(d=>activityStatus(d)==="dissolved"),activeVerified=filtered.filter(d=>d.agency_verified&&d.agency&&["active","mixed"].includes(activityStatus(d))),statusVerified=filtered.filter(d=>d.activity_verified||d.recent_activity_verified||d.recent_activity_year||["active","dissolved","mixed"].includes(activityStatus(d)));
  $("#agencyCoverage").innerHTML=`所属確認済み <b>${verified.length}</b> / ${filtered.length}組（${filtered.length?Math.round(verified.length/filtered.length*100):0}%） ／ 活動状態確認 ${statusVerified.length}組（${filtered.length?Math.round(statusVerified.length/filtered.length*100):0}%） ／ 現役扱い＋所属確認 ${activeVerified.length}組 ／ 解散確認済み ${dissolved.length}組${topM?` ／ M-1 TOP <b>${esc(topM.agency)}</b> ${topM.m1}pt`:""}${topK?` ／ KOC TOP <b>${esc(topK.agency)}</b> ${topK.koc}pt`:""}`;
  $("#agencyTableWrap").innerHTML=rows.length?`<table class="agencytable v211"><thead><tr><th>事務所</th><th>POWER</th><th>M-1 POWER</th><th>KOC POWER</th><th>COLOR</th><th>組数</th><th>1組平均</th><th>M-1 F / W</th><th>KOC F / W</th></tr></thead><tbody>${rows.slice(0,30).map(r=>{const mt=r.power?r.m1/r.power*100:50;return`<tr><td><strong>${esc(r.agency)}</strong><span class="agencybar" style="width:${Math.max(3,r.power/max*90)}px"></span></td><td class="agencypower"><strong>${r.power}</strong></td><td class="agencypower">${r.m1}<span class="agencysub">全確認点の ${r.mShare.toFixed(1)}%</span></td><td class="agencypower">${r.koc}<span class="agencysub">全確認点の ${r.kShare.toFixed(1)}%</span></td><td><span class="agencyprofile ${r.type.cls}">${r.type.label}</span><span class="agencybars"><i class="m1" style="width:${mt}%"></i><i class="koc" style="width:${100-mt}%"></i></span></td><td>${r.n}</td><td>${r.avg.toFixed(1)}</td><td>${r.mf} / ${r.mw}</td><td>${r.kf} / ${r.kw}</td></tr>`}).join("")}</tbody></table>`:'<div class="empty" style="padding:28px">現在条件では所属確認済みの得点データがありません。</div>';
};

// Agency scoring guide and final-audit guide.
const guidebar=document.querySelector(".guidebar");
if(guidebar&&!guidebar.querySelector('[data-guide="agency-power"]')){
  const b=document.createElement("button");b.className="guidebtn";b.type="button";b.dataset.guide="agency-power";b.textContent="事務所POWER";guidebar.appendChild(b);
  b.onclick=()=>{dialogTitle.textContent="事務所POWER";dialogContent.innerHTML=`<section class="dialogsection"><h3>M-1 POWER / KOC POWER</h3><p>各ユニットのM-1／KOC本体点を所属事務所ごとに合計します。配点は3回戦1点・準々決勝2点・準決勝3点・決勝5点・優勝15点。外部賞レースは含めません。</p><div class="dialogchips"><span>漫才特化 75%以上</span><span>漫才寄り 60–74%</span><span>二刀流 40–59%</span><span>コント寄り 26–39%</span><span>コント特化 25%以下</span></div></section><section class="dialogsection"><h3>シェア</h3><p>M-1列／KOC列の小さな％は、現在の検索・期間条件で所属確認できた全ユニットの大会点に占める事務所シェアです。期間を2025年などに切り替えるとその年の勢力図に変わります。</p></section><section class="dialogsection"><h3>注意</h3><p>所属はDBで確認済みの所属を利用します。大会当時所属を確定できたレコードは当時所属を優先していますが、全レコードを年次所属履歴として保持しているわけではないため、過去年の事務所シェアは参考値です。複数所属ユニットは「複数所属」カテゴリにまとめ、個別事務所へ二重加算しません。</p></section>`;infoDialog.showModal();};
}
if(guidebar&&!guidebar.querySelector('[data-guide="final-audit"]')){
  const b=document.createElement("button");b.className="guidebtn";b.type="button";b.dataset.guide="final-audit";b.textContent=structuralCount?`最終監査 ${structuralCount}`:"最終監査 ✓";b.style.color=structuralCount?"#e4c878":"#acd6b2";guidebar.appendChild(b);
  b.onclick=()=>{const A=window.M1KOC_FINAL_AUDIT;dialogTitle.textContent="FINAL DATA AUDIT";dialogContent.innerHTML=`<section class="dialogsection"><h3>${A.structural_issues?`要確認 ${A.structural_issues}件`:`構造監査 OK`}</h3><p>正規化重複、alias衝突、ラウンド表記、大会年範囲、説明のない「結成年＞初出年」を自動検査しています。</p><div class="dialogchips"><span>総ユニット ${A.total}</span><span>所属確認 ${A.agency_verified}</span><span>所属UNRESOLVED ${A.agency_unresolved.length}</span><span>結成年暫定/未確定 ${A.formed_provisional}</span></div></section><section class="dialogsection"><h3>今回の名寄せ修正</h3><p>${A.identity_fixes.map(esc).join(" ／ ")}</p></section><section class="dialogsection"><h3>正式結成前のユニット活動</h3><p>${A.explained_preformation.map(esc).join(" ／ ")}</p></section>`;infoDialog.showModal();};
}

// Refresh totals, audit subtitle, filters and the dashboard after split/corrections.
const hero211=document.getElementById("heroCount");if(hero211)hero211.textContent=DB.length.toLocaleString("ja-JP");
const all211=document.getElementById("sAll");if(all211)all211.textContent=DB.length;
const cover211=document.getElementById("coverCount");if(cover211)cover211.textContent=DB.length.toLocaleString("ja-JP")+" TEAMS";
const setStat=(id,n)=>{const e=document.getElementById(id);if(e)e.textContent=Number(n).toLocaleString("ja-JP")};
setStat("sM1",DB.filter(d=>Object.keys(d.m1||{}).length).length);
setStat("sM1old",DB.filter(d=>Object.keys(d.m1||{}).some(y=>Number(y)<=2010)).length);
setStat("sSeed",DB.filter(d=>d.m1_seed_2026).length);
setStat("sKoc",DB.filter(d=>Object.keys(d.koc||{}).length).length);
setStat("sBoth",DB.filter(d=>Object.keys(d.m1||{}).length&&Object.keys(d.koc||{}).length).length);
const dq211=document.querySelector(".dq-sub");if(dq211)dq211.textContent=`全${DB.length.toLocaleString("ja-JP")}組の未確定項目を実データから自動集計`;
// The original audit panel is initialized before late research patches; refresh its cards from final runtime data.
const dqCards211=document.getElementById("dqCards");if(dqCards211){
  const missFinal=d=>{let n=0;if(!d.agency_verified||!d.agency)n++;if(!d.formed||d.formed_verified===false||d.formed_research_status==="UNRESOLVED")n++;if(!d.activity_status&&!d.activity_verified)n++;return n};
  const vals=[["総収録",DB.length],["完全確認済",DB.filter(d=>missFinal(d)===0).length],["未解決あり",DB.filter(d=>missFinal(d)>0).length],["所属未確定",DB.filter(d=>!d.agency_verified||!d.agency).length],["結成年 暫定/未確定",DB.filter(d=>!d.formed||d.formed_verified===false||d.formed_research_status==="UNRESOLVED").length],["活動状態未確定",DB.filter(d=>!d.activity_status&&!d.activity_verified).length]];
  dqCards211.innerHTML=vals.map(([k,v])=>`<div class="dq-card"><span>${k}</span><b>${Number(v).toLocaleString("ja-JP")}</b></div>`).join("");
}
if(typeof populateAgencyFilter==="function")populateAgencyFilter();
window.M1KOC_CHECKPOINT={version:"v211",base_count:DB.length,focus:"final identity audit + agency M-1/KOC power",agency_verified:DB.filter(d=>d.agency_verified===true).length,agency_unresolved:DB.filter(d=>d.agency_verified!==true).length,structural_issues:structuralCount,checked_at:checkedAt,remaining_unresolved:DB.filter(d=>d.agency_verified!==true).map(d=>d.name)};
if(typeof render==="function")render();
})();

/* ---- retained patch boundary ---- */

/* v212 agency evolution / yearly strength analysis */
(()=>{
const evo=document.getElementById('agencyEvolution');if(!evo)return;
const rangeEl=document.getElementById('agencyTrendRange'),agencyEl=document.getElementById('agencyTrendSelect'),mapCanvas=document.getElementById('agencyMapChart'),dnaCanvas=document.getElementById('agencyDnaChart'),mapTip=document.getElementById('agencyMapTip');
const ranges={modern:[2015,2025],both:[2008,2025],all:[2001,2025]};
const eras=[{label:'2001–2007',from:2001,to:2007,note:'M-1 ONLY'},{label:'2008–2010',from:2008,to:2010,note:'BOTH'},{label:'2011–2014',from:2011,to:2014,note:'KOC ONLY'},{label:'2015–2019',from:2015,to:2019,note:'BOTH'},{label:'2020–2025',from:2020,to:2025,note:'BOTH'}];
let mapHits=[];
const yearsForRange=()=>{const [a,b]=ranges[rangeEl.value]||ranges.modern;return Array.from({length:b-a+1},(_,i)=>a+i)};
const evoScore=v=>scoreMode.value==='all'||stageKey(v)===scoreMode.value?baseScore(v):0;
const evoAgencyType=(m,k)=>{const t=m+k;if(!t)return{label:'—',cls:'dual'};const r=m/t;if(r>=.75)return{label:'漫才特化',cls:'m1'};if(r>=.60)return{label:'漫才寄り',cls:'m1'};if(r<=.25)return{label:'コント特化',cls:'koc'};if(r<.40)return{label:'コント寄り',cls:'koc'};return{label:'二刀流',cls:'dual'}};
const verifiedTeams=()=>DB.filter(d=>d.agency_verified&&d.agency);
const canonicalAgency=d=>{let k=d.agency_key||d.agency||'';if(k==='mixed')return'複数所属';if(k==='サンミュージック')return'サンミュージックプロダクション';if(k==='SMA NEET PROJECT')return'SMA';return k};
function yearlyAgency(contest,year,teams=verifiedTeams()){
  const m=new Map();
  for(const d of teams){const r=(d[contest]||{})[String(year)];if(!r)continue;const p=evoScore(r);if(!p)continue;const a=canonicalAgency(d);if(!a)continue;if(!m.has(a))m.set(a,{agency:a,power:0,teams:new Set(),finals:0,wins:0});const x=m.get(a);x.power+=p;x.teams.add(d.name);if(rank(r)>=90)x.finals++;if(stageKey(r)==='win')x.wins++;}
  return [...m.values()].map(x=>({...x,n:x.teams.size})).sort((a,b)=>b.power-a.power||b.n-a.n||a.agency.localeCompare(b.agency,'ja'));
}
function rangeAgency(from,to,teams=verifiedTeams()){
  const m=new Map();
  for(const d of teams){const a=canonicalAgency(d);if(!a)continue;if(!m.has(a))m.set(a,{agency:a,m1:0,koc:0,teams:new Set(),mFinal:0,kFinal:0,mWin:0,kWin:0});const x=m.get(a);x.teams.add(d.name);
    for(const [y,r] of Object.entries(d.m1||{})){const yy=+y;if(yy<from||yy>to)continue;const p=evoScore(r);x.m1+=p;if(p&&rank(r)>=90)x.mFinal++;if(p&&stageKey(r)==='win')x.mWin++;}
    for(const [y,r] of Object.entries(d.koc||{})){const yy=+y;if(yy<from||yy>to)continue;const p=evoScore(r);x.koc+=p;if(p&&rank(r)>=90)x.kFinal++;if(p&&stageKey(r)==='win')x.kWin++;}
  }
  return [...m.values()].map(x=>({...x,n:x.teams.size,power:x.m1+x.koc,type:evoAgencyType(x.m1,x.koc)})).filter(x=>x.power>0).sort((a,b)=>b.power-a.power||b.n-a.n);
}
function agencyYearSeries(agency,years){return years.map(y=>{const m=yearlyAgency('m1',y).find(x=>x.agency===agency),k=yearlyAgency('koc',y).find(x=>x.agency===agency);return{year:y,m1:m?.power||0,koc:k?.power||0}})}
function cctx(canvas){const dpr=Math.min(2,window.devicePixelRatio||1),r=canvas.getBoundingClientRect(),w=Math.max(300,Math.round(r.width)),h=Math.max(220,Math.round(r.height));canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);return{ctx,w,h}}
function populateAgency(){const all=rangeAgency(2001,2025);const old=agencyEl.value;agencyEl.innerHTML=all.map(x=>`<option value="${esc(x.agency)}">${esc(x.agency)}</option>`).join('');if(old&&all.some(x=>x.agency===old))agencyEl.value=old;else if(all.length)agencyEl.value=all[0].agency;}
function drawMap(){const years=yearsForRange(),from=years[0],to=years.at(-1),data=rangeAgency(from,to).slice(0,40),{ctx,w,h}=cctx(mapCanvas),pad={l:40,r:18,t:18,b:34},pw=w-pad.l-pad.r,ph=h-pad.t-pad.b,maxM=Math.max(1,...data.map(x=>x.m1)),maxK=Math.max(1,...data.map(x=>x.koc));
  ctx.font='8px Arial';ctx.lineWidth=1;ctx.textBaseline='middle';for(let i=0;i<=4;i++){const xx=pad.l+pw*i/4,yy=pad.t+ph-ph*i/4;ctx.strokeStyle='rgba(55,50,44,.14)';ctx.beginPath();ctx.moveTo(xx,pad.t);ctx.lineTo(xx,h-pad.b);ctx.stroke();ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(w-pad.r,yy);ctx.stroke();ctx.fillStyle='#777169';ctx.textAlign='center';ctx.fillText(Math.round(maxM*(i/4)*(i/4)),xx,h-pad.b+12);ctx.textAlign='right';ctx.fillText(Math.round(maxK*(i/4)*(i/4)),pad.l-6,yy)}ctx.textAlign='center';ctx.fillStyle='#777169';ctx.fillText('M-1 POWER →',pad.l+pw/2,h-9);ctx.save();ctx.translate(10,pad.t+ph/2);ctx.rotate(-Math.PI/2);ctx.fillText('KOC POWER →',0,0);ctx.restore();
  mapHits=[];const labels=new Set(data.slice(0,10).map(x=>x.agency));for(const x of data){const cx=pad.l+Math.sqrt(x.m1/maxM)*pw,cy=pad.t+ph-Math.sqrt(x.koc/maxK)*ph,r=Math.min(13,4+Math.sqrt(x.n)*.65),ratio=x.power?x.m1/x.power:.5;ctx.fillStyle=ratio>=.6?'rgba(239,90,84,.58)':ratio<.4?'rgba(107,165,223,.58)':'rgba(223,188,104,.65)';ctx.strokeStyle=ratio>=.6?'rgba(239,150,146,.62)':ratio<.4?'rgba(155,195,235,.62)':'rgba(228,200,120,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();ctx.stroke();mapHits.push({x:cx,y:cy,r:r+5,row:x});if(labels.has(x.agency)){ctx.fillStyle='#403c37';ctx.font='8px Arial';ctx.textAlign='left';ctx.fillText(x.agency,cx+r+3,cy)}}}
function drawDNA(){const years=yearsForRange(),agency=agencyEl.value,series=agencyYearSeries(agency,years),{ctx,w,h}=cctx(dnaCanvas),pad={l:35,r:18,t:16,b:30},pw=w-pad.l-pad.r,ph=h-pad.t-pad.b,max=Math.max(1,...series.flatMap(x=>[x.m1,x.koc]));ctx.font='8px Arial';ctx.textBaseline='middle';for(let i=0;i<=4;i++){const yy=pad.t+ph-ph*i/4;ctx.strokeStyle='rgba(55,50,44,.14)';ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(w-pad.r,yy);ctx.stroke();ctx.fillStyle='#777169';ctx.textAlign='right';ctx.fillText(Math.round(max*i/4),pad.l-6,yy)}const step=pw/Math.max(1,years.length-1);years.forEach((y,i)=>{if(i%Math.max(1,Math.ceil(years.length/7))===0||i===years.length-1){ctx.fillStyle='#777169';ctx.textAlign='center';ctx.fillText(String(y),pad.l+i*step,h-pad.b+12)}});
  const line=(key,color)=>{ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();series.forEach((d,i)=>{const x=pad.l+i*step,y=pad.t+ph-(d[key]/max)*ph;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();series.forEach((d,i)=>{if(!d[key])return;ctx.fillStyle=color;ctx.beginPath();ctx.arc(pad.l+i*step,pad.t+ph-(d[key]/max)*ph,2.5,0,Math.PI*2);ctx.fill()})};line('m1','#b85b57');line('koc','#5f8fb9');ctx.fillStyle='#ef9692';ctx.textAlign='left';ctx.fillText('M-1',pad.l,8);ctx.fillStyle='#9bc3eb';ctx.fillText('KOC',pad.l+34,8);
  const total=series.reduce((a,x)=>({m1:a.m1+x.m1,koc:a.koc+x.koc}),{m1:0,koc:0}),type=evoAgencyType(total.m1,total.koc),peakM=[...series].sort((a,b)=>b.m1-a.m1)[0],peakK=[...series].sort((a,b)=>b.koc-a.koc)[0];document.getElementById('agencyDnaLabel').textContent=`${agency} / ${type.label}`;document.getElementById('agencyEvoSummary').innerHTML=`<div class="evosum"><span>SELECTED AGENCY</span><b>${esc(agency)}</b></div><div class="evosum"><span>M-1 POWER</span><b class="m1">${total.m1}</b></div><div class="evosum"><span>KOC POWER</span><b class="koc">${total.koc}</b></div><div class="evosum"><span>COLOR</span><b class="dual">${type.label}</b></div><div class="evosum"><span>M-1 PEAK</span><b>${peakM?.m1?peakM.year+' / '+peakM.m1+'pt':'—'}</b></div><div class="evosum"><span>KOC PEAK</span><b>${peakK?.koc?peakK.year+' / '+peakK.koc+'pt':'—'}</b></div>`;
  document.getElementById('agencyColorShift').innerHTML=eras.map(e=>{const ss=agencyYearSeries(agency,Array.from({length:e.to-e.from+1},(_,i)=>e.from+i)),m=ss.reduce((s,x)=>s+x.m1,0),k=ss.reduce((s,x)=>s+x.koc,0);if(e.note!=='BOTH')return`<div class="shiftitem na"><span>${e.label}</span><b>${e.note}</b><span>${m+k} pt</span></div>`;const t=evoAgencyType(m,k);return`<div class="shiftitem"><span>${e.label}</span><b>${m+k} pt</b><span class="agencyprofile ${t.cls}">${t.label}</span></div>`}).join('');}
function renderEras(){document.getElementById('agencyEraGrid').innerHTML=eras.map(e=>{const m=e.note==='KOC ONLY'?[]:rangeAgency(e.from,e.to).filter(x=>x.m1>0).sort((a,b)=>b.m1-a.m1).slice(0,3),k=e.note==='M-1 ONLY'?[]:rangeAgency(e.from,e.to).filter(x=>x.koc>0).sort((a,b)=>b.koc-a.koc).slice(0,3);const rows=(tag,arr,key)=>arr.length?arr.map((x,i)=>`<div class="erarow"><span class="tag ${tag}">${tag.toUpperCase()} #${i+1}</span><span class="name" title="${esc(x.agency)}">${esc(x.agency)}</span><span class="pt">${x[key]}</span></div>`).join(''):`<div class="eramissing">${tag==='m1'?'M-1':'KOC'} 該当大会なし</div>`;return`<div class="eracard"><div class="era"><b>${e.label}</b><span>${e.note}</span></div>${rows('m1',m,'m1')}${rows('koc',k,'koc')}</div>`}).join('')}
function renderYearly(contest,target){const years=yearsForRange().filter(y=>contest==='m1'?((y>=2001&&y<=2010)||(y>=2015&&y<=2025)):y>=2008&&y<=2025).reverse();target.innerHTML=years.map(y=>{const rows=yearlyAgency(contest,y),sum=rows.reduce((s,x)=>s+x.power,0),top=rows.slice(0,3);if(!top.length)return`<div class="yearrow"><span class="year">${y}</span><span class="yearempty">データなし</span></div>`;return`<div class="yearrow"><span class="year">${y}</span>${top.map((x,i)=>`<span class="yearrank ${i===0?'first':''}" title="${esc(x.agency)}"><b>${i+1}. ${esc(x.agency)}</b><span>${x.power}pt${i===0&&sum?` / ${(x.power/sum*100).toFixed(1)}%`:''}</span></span>`).join('')}</div>`}).join('')}
function renderEvolution(){populateAgency();drawMap();drawDNA();renderEras();renderYearly('m1',document.getElementById('agencyM1Yearly'));renderYearly('koc',document.getElementById('agencyKocYearly'));}
function mapPoint(e){const r=mapCanvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;return mapHits.find(p=>Math.hypot(x-p.x,y-p.y)<=p.r)}
mapCanvas.addEventListener('pointermove',e=>{const p=mapPoint(e);if(!p){mapTip.classList.remove('show');return}const box=mapCanvas.parentElement.getBoundingClientRect();mapTip.innerHTML=`<b>${esc(p.row.agency)}</b><br><span class="tm1">M-1 ${p.row.m1}pt</span> ／ <span class="tkoc">KOC ${p.row.koc}pt</span><br>${p.row.n}組・${p.row.type.label}`;mapTip.style.left=Math.min(e.clientX-box.left+10,box.width-170)+'px';mapTip.style.top=(e.clientY-box.top+8)+'px';mapTip.classList.add('show')});
mapCanvas.addEventListener('pointerleave',()=>mapTip.classList.remove('show'));mapCanvas.addEventListener('click',e=>{const p=mapPoint(e);if(p&&[...agencyEl.options].some(o=>o.value===p.row.agency)){agencyEl.value=p.row.agency;drawDNA()}});
rangeEl.addEventListener('change',renderEvolution);agencyEl.addEventListener('change',drawDNA);
document.getElementById('agencyPowerCsv').addEventListener('click',()=>{const rows=[['年','事務所','M-1_POWER','KOC_POWER','TOTAL_POWER','COLOR']];for(const y of yearsForRange()){const m=new Map();for(const x of yearlyAgency('m1',y))m.set(x.agency,{m1:x.power,koc:0});for(const x of yearlyAgency('koc',y)){if(!m.has(x.agency))m.set(x.agency,{m1:0,koc:0});m.get(x.agency).koc=x.power}for(const [a,x] of m){const t=evoAgencyType(x.m1,x.koc);rows.push([y,a,x.m1,x.koc,x.m1+x.koc,t.label])}}const csv=rows.map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\r\n'),blob=new Blob(['\uFEFF'+csv],{type:'text/csv'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=`agency_power_${rangeEl.value}_v214.csv`;a.click();URL.revokeObjectURL(u)});
let rz;addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{drawMap();drawDNA()},160)});
// Keep this panel synced with scoring-mode changes and ordinary renders without coupling it to the main period selector.
const wireAgencyRows=()=>{document.querySelectorAll('#agencyTableWrap tbody tr').forEach(tr=>{tr.classList.add('agencyrowlink');tr.title='この事務所の年度推移を見る';tr.onclick=()=>{const a=tr.cells?.[0]?.querySelector('strong')?.textContent?.trim();if(!a||![...agencyEl.options].some(o=>o.value===a))return;agencyEl.value=a;drawDNA();evo.scrollIntoView({behavior:'smooth',block:'start'})}})};
let agencyEvolutionDirty=true;
const agencyEvolutionVisible=()=>{const el=document.getElementById('agencyEvolution');return !!el&&!el.hidden};
const oldAgencyRender=renderAgencyDashboard;renderAgencyDashboard=function(filtered){oldAgencyRender(filtered);agencyEvolutionDirty=true;requestAnimationFrame(()=>{wireAgencyRows();if(agencyEvolutionVisible()){renderEvolution();agencyEvolutionDirty=false}})};
window.M1KOC_AGENCY_EVOLUTION={version:'v216',ranges,eras,method:'M-1/KOC base score by year; historical affiliation is reference-only'};
window.M1KOC_CHECKPOINT={...(window.M1KOC_CHECKPOINT||{}),version:'v212',focus:'final audit + agency evolution / yearly M-1 KOC power'};
window.M1KOC_RENDER_AGENCY_EVOLUTION=renderEvolution;
wireAgencyRows();
})();

/* ---- retained patch boundary ---- */

/* v213 public release: KOC 2026 Sep-10 update + release integrity */
(()=>{
  const checkedAt='2026-09-14';
  const finalists=['相性はいいよね','蛙亭','元祖いちごちゃん','ザ・マミィ','ジェラードン','ダウ90000','ななまがり','ニッポンの社長','や団','ヤッホイ'];
  const repechage=['江戸川ジャンクジャンク','オフローズ','cacao','喫茶ムーン','しずる','生姜猫','スパイシーガーリック','そいつどいつ','ネルソンズ','破壊ありがとう'];
  const finalSrc='https://king-of-conte.com/news/finalist/';
  const repSrc='https://king-of-conte.com/news/post-1762/';
  const byName=new Map(DB.map(d=>[d.name,d]));
  for(const name of finalists){const d=byName.get(name);if(!d)continue;d.koc=d.koc||{};d.koc['2026']='決勝';d.koc_finalist_2026=true;d.koc_2026_source=finalSrc;d.koc_2026_checked_at=checkedAt;}
  for(const name of repechage){const d=byName.get(name);if(!d)continue;d.koc=d.koc||{};if(!d.koc['2026'])d.koc['2026']='準決勝';d.koc_repechage_2026=true;d.koc_repechage_source=repSrc;d.koc_2026_checked_at=checkedAt;}
  const dqSub=document.querySelector('.dq-sub');if(dqSub)dqSub.textContent=`全${DB.length.toLocaleString('ja-JP')}組の未確定項目を実データから自動集計`;
  const hero=document.getElementById('heroCount');if(hero)hero.textContent=DB.length.toLocaleString('ja-JP');
  const staticRelease=document.querySelector('meta[name="data-release"]');if(staticRelease)staticRelease.content='public-ui-2026-09-14-v214';
  const missing=[...finalists,...repechage].filter(n=>!byName.has(n));
  window.M1KOC_PUBLIC_RELEASE={version:'v214',checked_at:checkedAt,total:DB.length,koc_2026_finalists:finalists.length,koc_2026_repechage:repechage.length,missing_current_names:missing,ogp:'https://inaryu070.github.io/m1-koc-database/ogp.png',canonical:'https://inaryu070.github.io/m1-koc-database/'};
  window.M1KOC_CHECKPOINT={...(window.M1KOC_CHECKPOINT||{}),version:'v214',focus:'GitHub public-release hardening + KOC 2026 Sep-10 update',checked_at:checkedAt};
  if(typeof render==='function')render();
})();

/* ---- retained patch boundary ---- */

/* v214 public hardening marker */
window.M1KOC_PUBLIC_HARDENING={version:'v214',checked_at:'2026-09-14',items:['og-image-fallback','seo-metadata','structured-data','noscript-guidance','correction-link','aria-live-share-status']};


/* v215 agency coverage fix */
window.M1KOC_AGENCY_COVERAGE_FIX={version:'v215',checked_at:'2026-09-14',method:'agency power uses all agency_verified records; activity status narrows only when explicitly filtered'};


/* v216 agency tabs + lazy evolution rendering */
(()=>{
  const tabs=document.getElementById('agencyTabs');
  const power=document.getElementById('agencyDashboard');
  const evolution=document.getElementById('agencyEvolution');
  if(!tabs||!power||!evolution)return;
  const tournament=document.getElementById('agencyTournament');
  const insights=document.getElementById('agencyInsights');
  const visuals=document.getElementById('agencyVisuals');
  const buttons=[...tabs.querySelectorAll('[data-agency-tab]')];
  const setTab=(name,{scroll=false}={})=>{
    const panels={power,evolution,tournament,insights,visuals};
    for(const [key,panel] of Object.entries(panels)){if(panel)panel.hidden=key!==name}
    for(const b of buttons){const on=b.dataset.agencyTab===name;b.classList.toggle('on',on);b.setAttribute('aria-selected',on?'true':'false')}
    try{sessionStorage.setItem('m1kocAgencyTab',name)}catch(e){}
    if(name==='evolution'&&typeof window.M1KOC_RENDER_AGENCY_EVOLUTION==='function'){requestAnimationFrame(()=>window.M1KOC_RENDER_AGENCY_EVOLUTION())}
    if(name==='tournament'&&typeof window.M1KOC_RENDER_AGENCY_TOURNAMENT==='function'){requestAnimationFrame(()=>window.M1KOC_RENDER_AGENCY_TOURNAMENT())}
    if(name==='insights'&&typeof window.M1KOC_RENDER_AGENCY_INSIGHTS==='function'){requestAnimationFrame(()=>window.M1KOC_RENDER_AGENCY_INSIGHTS())}
    if(name==='visuals'&&typeof window.M1KOC_RENDER_AGENCY_VISUALS==='function'){requestAnimationFrame(()=>window.M1KOC_RENDER_AGENCY_VISUALS())}
    if(scroll)tabs.scrollIntoView({behavior:'smooth',block:'start'});
  };
  tabs.addEventListener('click',e=>{const b=e.target.closest('[data-agency-tab]');if(b)setTab(b.dataset.agencyTab)});
  let initial='power';try{const saved=sessionStorage.getItem('m1kocAgencyTab');if(['power','evolution','tournament','insights','visuals'].includes(saved))initial=saved}catch(e){}
  setTab(initial);
  // Expose for agency-row click and external navigation.
  window.M1KOC_SET_AGENCY_TAB=(name,opts)=>setTab(name,opts||{});
  // Rewire table rows after every dashboard update without eagerly drawing evolution charts.
  const rewire=()=>document.querySelectorAll('#agencyTableWrap tbody tr').forEach(tr=>{
    tr.classList.add('agencyrowlink');tr.title='この事務所の年度推移を見る';
    tr.onclick=()=>{const a=tr.cells?.[0]?.querySelector('strong')?.textContent?.trim();const sel=document.getElementById('agencyTrendSelect');if(!a||!sel)return;setTab('evolution',{scroll:true});requestAnimationFrame(()=>{if(typeof window.M1KOC_RENDER_AGENCY_EVOLUTION==='function')window.M1KOC_RENDER_AGENCY_EVOLUTION();if([...sel.options].some(o=>o.value===a)){sel.value=a;if(typeof window.M1KOC_RENDER_AGENCY_EVOLUTION==='function')window.M1KOC_RENDER_AGENCY_EVOLUTION()}})};
  });
  const table=document.getElementById('agencyTableWrap');if(table)new MutationObserver(rewire).observe(table,{childList:true,subtree:true});rewire();
  window.M1KOC_UI_OPTIMIZATION={version:'v216',agency_tabs:true,lazy_agency_evolution:true,initial_cards:{mobile:32,desktop:80}};
})();

window.M1KOC_CHECKPOINT={...(window.M1KOC_CHECKPOINT||{}),version:'v218',focus:'true DATABASE / AGENCY top-level tabs + reduced visible DOM',checked_at:'2026-09-14'};


/* v218 top-level DATABASE / AGENCY true view tabs */
(()=>{
  const tabs=document.getElementById('primaryTabs');
  if(!tabs)return;
  const buttons=[...tabs.querySelectorAll('[data-primary-target]')];
  const dbSelectors=['.nextstar.nextstar-v2','.featurebar','#search','.sectionlabel','.stats','#grid','#comparebar','#about','#analytics'];
  const agencySelectors=['#agencyTabs','#agencyDashboard','#agencyEvolution','#agencyTournament','#agencyInsights','#agencyVisuals'];
  const discoverySelectors=['#discoveryRoot'];
  const els=(selectors)=>selectors.flatMap(sel=>[...document.querySelectorAll(sel)]);
  const dbEls=els(dbSelectors), agencyEls=els(agencySelectors), discoveryEls=els(discoverySelectors);
  const setHidden=(list,hidden)=>list.forEach(el=>el.classList.toggle('primary-view-hidden',hidden));
  const setPrimary=(name,scroll=true)=>{
    const agency=name==='agency', discovery=name==='discovery', database=name==='database';
    document.body.classList.toggle('primary-agency',agency);
    document.body.classList.toggle('primary-database',database);
    document.body.classList.toggle('primary-discovery',discovery);
    setHidden(dbEls,!database);
    setHidden(agencyEls,!agency);
    setHidden(discoveryEls,!discovery);
    for(const b of buttons){
      const on=b.dataset.primaryTarget===name;
      b.classList.toggle('on',on);
      b.setAttribute('aria-selected',on?'true':'false');
    }
    if(agency){
      const power=document.getElementById('agencyTabPower');
      if(power && power.getAttribute('aria-selected')!=='true') power.click();
      requestAnimationFrame(()=>{
        try{window.dispatchEvent(new Event('resize'))}catch(_e){}
      });
    }
    try{history.replaceState(null,'',agency?'#agency':discovery?'#discovery':'#database')}catch(_e){}
    if(scroll)document.getElementById('primaryTabs')?.scrollIntoView({behavior:'smooth',block:'start'});
  };
  tabs.addEventListener('click',e=>{
    const b=e.target.closest('[data-primary-target]');
    if(b)setPrimary(b.dataset.primaryTarget,true);
  });
  document.querySelector('.sitehead .nav a[href="#agencyTabs"]')?.addEventListener('click',e=>{e.preventDefault();setPrimary('agency',true)});
  document.querySelector('.sitehead .nav a[href="#search"]')?.addEventListener('click',e=>{e.preventDefault();setPrimary('database',true)});
  document.querySelector('.sitehead .nav a[href="#discoveryRoot"]')?.addEventListener('click',e=>{e.preventDefault();setPrimary('discovery',true)});
  setPrimary(location.hash==='#agency'?'agency':location.hash==='#discovery'?'discovery':'database',false);
  window.M1KOC_PRIMARY_VIEW={set:setPrimary,version:'v224'};
})();


/* shared agency normalizer for v219+ analytics (v238 runtime fix) */
const agencyCanonical=d=>{let k=d.agency_key||d.agency||'';if(k==='mixed')return'複数所属';if(k==='サンミュージック')return'サンミュージックプロダクション';if(k==='SMA NEET PROJECT')return'SMA';return k};

window.M1KOC_RUNTIME_FIX={version:'v238',fix:'shared agencyCanonical for v219+ analytics',checked_at:'2026-09-15'};

/* v219 tournament-by-tournament agency balance */
(()=>{
  const root=document.getElementById('agencyTournament');
  if(!root)return;
  const contestEl=document.getElementById('tourContest'),yearEl=document.getElementById('tourYear'),minEl=document.getElementById('tourMinN');
  const summary=document.getElementById('tourSummary'),tableWrap=document.getElementById('tourTableWrap'),canvas=document.getElementById('tourScatter'),tip=document.getElementById('tourTip'),mapLabel=document.getElementById('tourMapLabel');
  const stageLabel=v=>/優勝/.test(v)?'優勝':/^決勝/.test(v)?'決勝':/準決勝/.test(v)?'準決勝':/準々決勝/.test(v)?'準々決勝':/3回戦|３回戦/.test(v)?'3回戦':String(v||'—');
  const score=v=>({r3:1,qf:2,sf:3,final:5,win:15})[stageKey(v)]||0;
  const contestYears=c=>[...new Set(DB.flatMap(d=>Object.keys((c==='m1'?d.m1:d.koc)||{})).map(Number).filter(Boolean))].sort((a,b)=>b-a);
  function fillYears(){const years=contestYears(contestEl.value),keep=Number(yearEl.value);yearEl.innerHTML=years.map(y=>`<option value="${y}">${y}</option>`).join('');if(years.includes(keep))yearEl.value=String(keep);else if(years.length)yearEl.value=String(years[0]);}
  function rows(){
    const c=contestEl.value,y=String(yearEl.value),by=new Map();
    for(const d of DB){if(!d.agency_verified||!d.agency)continue;const result=(c==='m1'?d.m1:d.koc)?.[y];if(!result)continue;const a=agencyCanonical(d);if(!by.has(a))by.set(a,[]);by.get(a).push({d,result,pt:score(result)});}
    const totalPts=[...by.values()].flat().reduce((s,x)=>s+x.pt,0);
    return [...by.entries()].map(([agency,items])=>{
      const total=items.reduce((s,x)=>s+x.pt,0),n=items.length,avg=n?total/n:0,sf=items.filter(x=>rank(x.result)>=70).length;
      const top=[...items].sort((a,b)=>rank(b.result)-rank(a.result)||b.pt-a.pt||a.d.name.localeCompare(b.d.name,'ja'))[0];
      return{agency,n,total,avg,sfRate:n?sf/n*100:0,share:totalPts?total/totalPts*100:0,topName:top?.d.name||'—',topStage:stageLabel(top?.result),topRank:rank(top?.result)||0};
    }).sort((a,b)=>b.avg-a.avg||b.total-a.total||b.n-a.n||a.agency.localeCompare(b.agency,'ja'));
  }
  let hits=[];
  function draw(data){
    const minN=Number(minEl.value),shown=data.filter(x=>x.n>=minN),r=canvas.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1),w=Math.max(300,r.width||300),h=Math.max(250,r.height||300);canvas.width=w*dpr;canvas.height=h*dpr;const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);hits=[];
    const pad={l:42,r:18,t:18,b:34},pw=w-pad.l-pad.r,ph=h-pad.t-pad.b,maxN=Math.max(minN,...shown.map(x=>x.n),1),maxA=Math.max(1,...shown.map(x=>x.avg));ctx.font='8px Arial';ctx.textBaseline='middle';
    for(let i=0;i<=4;i++){const yy=pad.t+ph-ph*i/4;ctx.strokeStyle='rgba(55,50,44,.14)';ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(w-pad.r,yy);ctx.stroke();ctx.fillStyle='#777169';ctx.textAlign='right';ctx.fillText((maxA*i/4).toFixed(1),pad.l-6,yy)}
    for(let i=0;i<=4;i++){const xx=pad.l+pw*i/4;ctx.strokeStyle='rgba(55,50,44,.09)';ctx.beginPath();ctx.moveTo(xx,pad.t);ctx.lineTo(xx,pad.t+ph);ctx.stroke();ctx.fillStyle='#777169';ctx.textAlign='center';ctx.fillText(String(Math.round(maxN*i/4)),xx,h-pad.b+13)}
    ctx.fillStyle='#777169';ctx.textAlign='left';ctx.fillText('AVG',4,10);ctx.textAlign='right';ctx.fillText('n',w-5,h-8);
    const labels=new Set(shown.slice(0,8).map(x=>x.agency));
    shown.forEach((x,i)=>{const cx=pad.l+(x.n/maxN)*pw,cy=pad.t+ph-(x.avg/maxA)*ph,rr=Math.max(3,Math.min(8,3+Math.sqrt(x.total)*.7));ctx.fillStyle=i<3?'rgba(223,188,104,.72)':'rgba(174,177,184,.48)';ctx.strokeStyle=i<3?'rgba(223,188,104,.95)':'rgba(210,212,218,.42)';ctx.beginPath();ctx.arc(cx,cy,rr,0,Math.PI*2);ctx.fill();ctx.stroke();hits.push({x:cx,y:cy,r:rr+7,row:x});if(labels.has(x.agency)){ctx.fillStyle='#403c37';ctx.font='8px Arial';ctx.textAlign='left';ctx.fillText(x.agency,cx+rr+3,cy)}});
  }
  function render(){
    const data=rows(),minN=Number(minEl.value),qualified=data.filter(x=>x.n>=minN),below=data.filter(x=>x.n<minN),totalN=data.reduce((s,x)=>s+x.n,0),totalPts=data.reduce((s,x)=>s+x.total,0),leader=qualified[0],volume=[...data].sort((a,b)=>b.n-a.n||b.total-a.total)[0],power=[...data].sort((a,b)=>b.total-a.total||b.n-a.n)[0],concentration=power?power.share:0;
    summary.innerHTML=`<div class="evosum"><span>${contestEl.value==='m1'?'M-1':'KOC'} ${yearEl.value}</span><b>${totalN}組</b></div><div class="evosum"><span>QUALITY LEADER</span><b>${leader?esc(leader.agency)+' / '+leader.avg.toFixed(2):'—'}</b></div><div class="evosum"><span>VOLUME LEADER</span><b>${volume?esc(volume.agency)+' / n='+volume.n:'—'}</b></div><div class="evosum"><span>TOTAL POWER</span><b>${power?esc(power.agency)+' / '+power.total+'pt':'—'}</b></div><div class="evosum"><span>TOP SHARE</span><b>${concentration.toFixed(1)}%</b></div><div class="evosum"><span>MIN SAMPLE</span><b>n ≥ ${minN}</b></div>`;
    const table=(arr,belowFlag=false)=>arr.map((x,i)=>`<tr class="${belowFlag?'below':i<3?'top':''}"><td class="rank">${belowFlag?'—':i+1}</td><td><strong>${esc(x.agency)}</strong>${x.n>=minN?'<span class="tourbadge qual">QUAL</span>':''}</td><td class="avg"><strong>${x.avg.toFixed(2)}</strong></td><td>${x.total}</td><td>${x.n}</td><td>${x.sfRate.toFixed(1)}%</td><td class="share">${x.share.toFixed(1)}%</td><td><span class="tourtopname" title="${esc(x.topName)}">${esc(x.topName)}</span><span class="agencysub">${x.topStage}</span></td></tr>`).join('');
    tableWrap.innerHTML=`<div class="tour-subhead"><b>ランキング対象 ${qualified.length}事務所</b><span>AVG / TOTAL / n / SF+ / SHARE</span></div><table class="tourtable"><thead><tr><th>#</th><th>事務所</th><th>AVG</th><th>TOTAL</th><th>n</th><th>SF+率</th><th>SHARE</th><th>TOP</th></tr></thead><tbody>${table(qualified)}${below.length?`<tr><td colspan="8" style="padding:12px 6px 5px;color:#666970;text-align:left">参考値：n &lt; ${minN}</td></tr>${table(below,true)}`:''}</tbody></table>`;
    mapLabel.textContent=`n ≥ ${minN}`;draw(data);
  }
  function hitAt(e){const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;return hits.find(p=>Math.hypot(x-p.x,y-p.y)<=p.r)}
  canvas.addEventListener('pointermove',e=>{const p=hitAt(e);if(!p){tip.classList.remove('show');return}const b=canvas.parentElement.getBoundingClientRect();tip.innerHTML=`<b>${esc(p.row.agency)}</b><br>AVG ${p.row.avg.toFixed(2)} ／ TOTAL ${p.row.total}pt<br>n=${p.row.n} ／ SF+ ${p.row.sfRate.toFixed(1)}%`;tip.style.left=Math.min(e.clientX-b.left+10,b.width-190)+'px';tip.style.top=(e.clientY-b.top+8)+'px';tip.classList.add('show')});canvas.addEventListener('pointerleave',()=>tip.classList.remove('show'));
  contestEl.addEventListener('change',()=>{fillYears();render()});yearEl.addEventListener('change',render);minEl.addEventListener('change',render);
  document.getElementById('tourCsv').addEventListener('click',()=>{const data=rows(),minN=Number(minEl.value),out=[['大会','年','事務所','AVG_POINT','TOTAL_POINT','n','SF_PLUS_RATE','POINT_SHARE','TOP_TEAM','TOP_STAGE','QUALIFIED']];for(const x of data)out.push([contestEl.value==='m1'?'M-1':'KOC',yearEl.value,x.agency,x.avg.toFixed(3),x.total,x.n,x.sfRate.toFixed(1),x.share.toFixed(1),x.topName,x.topStage,x.n>=minN?'YES':'NO']);const csv=out.map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\r\n'),blob=new Blob(['\uFEFF'+csv],{type:'text/csv'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=`agency_tournament_${contestEl.value}_${yearEl.value}_v219.csv`;a.click();URL.revokeObjectURL(u)});
  let rt;addEventListener('resize',()=>{if(root.hidden)return;clearTimeout(rt);rt=setTimeout(render,140)});
  fillYears();if(contestYears('m1').includes(2025))yearEl.value='2025';render();
  window.M1KOC_RENDER_AGENCY_TOURNAMENT=render;
  window.M1KOC_AGENCY_TOURNAMENT={version:'v219',default_min_n:5,thresholds:[3,5,10],metrics:['avg_point','total_point','n','sf_plus_rate','point_share','top_team']};
  window.M1KOC_CHECKPOINT={...(window.M1KOC_CHECKPOINT||{}),version:'v219',focus:'agency tournament balance / quality x volume',checked_at:'2026-09-14'};
})();


/* v220 agency archetype / depth / breakthrough / retention insights */
(()=>{
  const root=document.getElementById('agencyInsights');
  if(!root)return;
  const rangeEl=document.getElementById('insightRange'),minEl=document.getElementById('insightMinN'),summary=document.getElementById('insightSummary'),tableWrap=document.getElementById('insightTableWrap'),cards=document.getElementById('archetypeCards'),canvas=document.getElementById('insightScatter'),tip=document.getElementById('insightTip');
  const baseScore=v=>({r3:1,qf:2,sf:3,final:5,win:15})[stageKey(v)]||0;
  const bounds=()=>rangeEl.value==='modern'?[2015,2025]:rangeEl.value==='both'?[2008,2025]:[2001,2025];
  const inRange=y=>{const [a,b]=bounds();return +y>=a&&+y<=b};
  const quantile=(arr,q)=>{const a=arr.filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return 0;const i=(a.length-1)*q,lo=Math.floor(i),hi=Math.ceil(i);return lo===hi?a[lo]:a[lo]*(hi-i)+a[hi]*(i-lo)};
  const yearsByContest=c=>new Set(DB.flatMap(d=>Object.keys((c==='m1'?d.m1:d.koc)||{})).map(Number).filter(Boolean));
  const globalYears={m1:yearsByContest('m1'),koc:yearsByContest('koc')};
  function data(){
    const by=new Map();
    for(const d of DB){
      if(!d.agency_verified||!d.agency)continue;
      const agency=agencyCanonical(d);if(!by.has(agency))by.set(agency,[]);by.get(agency).push(d);
    }
    const out=[];
    for(const [agency,teams] of by){
      let m1=0,koc=0,total=0,activeTeams=0,breakthroughTeams=0,retained=0,retEligible=0,cross=0,acePts=0;const teamPts=[];
      for(const d of teams){
        let tm=0,tk=0,tp=0,hasAny=false;
        for(const [y,v] of Object.entries(d.m1||{})){if(inRange(y)){const pt=baseScore(v);tm+=pt;tp+=pt;if(pt)hasAny=true}}
        for(const [y,v] of Object.entries(d.koc||{})){if(inRange(y)){const pt=baseScore(v);tk+=pt;tp+=pt;if(pt)hasAny=true}}
        if(!hasAny)continue;
        activeTeams++;m1+=tm;koc+=tk;total+=tp;teamPts.push(tp);if(tm>0&&tk>0)cross++;
        let firstSf=Infinity;
        for(const c of ['m1','koc'])for(const [y,v] of Object.entries((c==='m1'?d.m1:d.koc)||{})){if(rank(v)>=70)firstSf=Math.min(firstSf,+y)}
        if(Number.isFinite(firstSf)&&inRange(firstSf))breakthroughTeams++;
        for(const c of ['m1','koc']){
          const obj=(c==='m1'?d.m1:d.koc)||{};
          for(const [ys,v] of Object.entries(obj)){
            const y=+ys;if(!inRange(y)||rank(v)<50||!globalYears[c].has(y+1)||!inRange(y+1))continue;
            retEligible++;if(rank(obj[String(y+1)])>=50)retained++;
          }
        }
      }
      acePts=teamPts.length?Math.max(...teamPts):0;
      if(!activeTeams)continue;
      const avg=total/activeTeams,ace=total?acePts/total*100:0,depth=100-ace,breakRate=breakthroughTeams/activeTeams*100,retention=retEligible?retained/retEligible*100:0,crossRate=cross/activeTeams*100;
      const dnaShare=total?m1/total*100:50,dna=dnaShare>=70?'漫才特化型':dnaShare<=30?'コント特化型':'二刀流型';
      out.push({agency,n:activeTeams,total,avg,m1,koc,ace,depth,breakthroughTeams,breakRate,retained,retEligible,retention,cross,crossRate,dna});
    }
    const minN=+minEl.value,qualified=out.filter(x=>x.n>=minN),src=qualified.length?qualified:out;
    const t={n50:quantile(src.map(x=>x.n),.5),n75:quantile(src.map(x=>x.n),.75),avg75:quantile(src.map(x=>x.avg),.75),depth75:quantile(src.map(x=>x.depth),.75),ace75:quantile(src.map(x=>x.ace),.75),break75:quantile(src.map(x=>x.breakRate),.75),ret75:quantile(src.filter(x=>x.retEligible>=3).map(x=>x.retention),.75)};
    for(const x of out){
      let a='バランス型';
      if(x.n>=t.n75&&x.depth>=t.depth75)a='大型層厚型';
      else if(x.avg>=t.avg75&&x.n<=t.n50)a='少数精鋭型';
      else if(x.breakthroughTeams>=2&&x.breakRate>0&&x.breakRate>=t.break75)a='新星供給型';
      else if(x.retEligible>=3&&x.retention>0&&x.retention>=t.ret75)a='安定供給型';
      else if(x.total>0&&x.ace>=t.ace75)a='エース牽引型';
      x.archetype=a;
    }
    return out.sort((a,b)=>b.total-a.total||b.n-a.n||a.agency.localeCompare(b.agency,'ja'));
  }
  let hits=[];
  function draw(rows){
    const minN=+minEl.value,shown=rows.filter(x=>x.n>=minN),r=canvas.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1),w=Math.max(300,r.width||300),h=Math.max(260,r.height||300);canvas.width=w*dpr;canvas.height=h*dpr;const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);hits=[];
    const pad={l:42,r:20,t:18,b:34},pw=w-pad.l-pad.r,ph=h-pad.t-pad.b,maxN=Math.max(minN,...shown.map(x=>x.n),1),maxA=Math.max(1,...shown.map(x=>x.avg));ctx.font='8px Arial';ctx.textBaseline='middle';
    for(let i=0;i<=4;i++){const yy=pad.t+ph-ph*i/4;ctx.strokeStyle='rgba(55,50,44,.14)';ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(w-pad.r,yy);ctx.stroke();ctx.fillStyle='#777169';ctx.textAlign='right';ctx.fillText((maxA*i/4).toFixed(1),pad.l-6,yy)}
    for(let i=0;i<=4;i++){const xx=pad.l+pw*i/4;ctx.strokeStyle='rgba(55,50,44,.09)';ctx.beginPath();ctx.moveTo(xx,pad.t);ctx.lineTo(xx,pad.t+ph);ctx.stroke();ctx.fillStyle='#777169';ctx.textAlign='center';ctx.fillText(String(Math.round(maxN*i/4)),xx,h-pad.b+13)}
    ctx.fillStyle='#777169';ctx.textAlign='left';ctx.fillText('AVG',4,10);ctx.textAlign='right';ctx.fillText('n',w-5,h-8);
    const labels=new Set([...shown].sort((a,b)=>b.total-a.total).slice(0,8).map(x=>x.agency));
    shown.forEach(x=>{const cx=pad.l+(x.n/maxN)*pw,cy=pad.t+ph-(x.avg/maxA)*ph,rr=3+Math.max(0,Math.min(7,x.depth/100*7));ctx.fillStyle=x.dna==='漫才特化型'?'rgba(239,90,84,.58)':x.dna==='コント特化型'?'rgba(107,165,223,.58)':'rgba(223,188,104,.6)';ctx.strokeStyle='rgba(45,41,36,.38)';ctx.beginPath();ctx.arc(cx,cy,rr,0,Math.PI*2);ctx.fill();ctx.stroke();hits.push({x:cx,y:cy,r:rr+7,row:x});if(labels.has(x.agency)){ctx.fillStyle='#403c37';ctx.textAlign='left';ctx.fillText(x.agency,cx+rr+3,cy)}});
  }
  function render(){
    const rows=data(),minN=+minEl.value,q=rows.filter(x=>x.n>=minN),top=[...q].sort((a,b)=>b.total-a.total)[0],deep=[...q].sort((a,b)=>b.depth-a.depth||b.total-a.total)[0],newstar=[...q].sort((a,b)=>b.breakRate-a.breakRate||b.breakthroughTeams-a.breakthroughTeams)[0],stable=[...q].filter(x=>x.retEligible>=3).sort((a,b)=>b.retention-a.retention||b.retEligible-a.retEligible)[0],cross=[...q].sort((a,b)=>b.crossRate-a.crossRate||b.cross-a.cross)[0];
    const [a,b]=bounds();summary.innerHTML=`<div class="evosum"><span>PERIOD</span><b>${a}–${b}</b></div><div class="evosum"><span>QUALIFIED</span><b>${q.length}事務所</b></div><div class="evosum"><span>POWER LEADER</span><b>${top?esc(top.agency)+' / '+top.total+'pt':'—'}</b></div><div class="evosum"><span>DEEPEST ROSTER</span><b>${deep?esc(deep.agency)+' / '+deep.depth.toFixed(1)+'%':'—'}</b></div><div class="evosum"><span>NEW STAR RATE</span><b>${newstar?esc(newstar.agency)+' / '+newstar.breakRate.toFixed(1)+'%':'—'}</b></div><div class="evosum"><span>MIN SAMPLE</span><b>n ≥ ${minN}</b></div>`;
    const card=(cap,x,metric,detail)=>`<div class="atypecard"><span>${cap}</span><b>${x?esc(x.agency):'—'}</b><small>${x?metric(x):'該当なし'}</small>${x?`<span class="atypepill">${x.archetype}</span>`:''}</div>`;
    cards.innerHTML=card('DEEPEST ROSTER',deep,x=>`DEPTH ${x.depth.toFixed(1)}% / TOP1依存 ${x.ace.toFixed(1)}%`)+card('BREAKTHROUGH',newstar,x=>`初SF+ ${x.breakthroughTeams}組 / ${x.breakRate.toFixed(1)}%`)+card('RETENTION',stable,x=>`翌年QF+維持 ${x.retention.toFixed(1)}% / 判定${x.retEligible}件`)+card('CROSSOVER',cross,x=>`M-1×KOC両方 ${x.cross}組 / ${x.crossRate.toFixed(1)}%`);
    const dnaClass=x=>x.dna==='漫才特化型'?'m1':x.dna==='コント特化型'?'koc':'dual';
    tableWrap.innerHTML=`<table class="insighttable"><thead><tr><th>#</th><th>事務所</th><th>ARCHETYPE</th><th>DNA</th><th>POWER</th><th>AVG</th><th>n</th><th>DEPTH</th><th>TOP1依存</th><th>BREAKTHROUGH</th><th>RETENTION</th><th>CROSSOVER</th></tr></thead><tbody>${rows.map((x,i)=>`<tr class="${x.n<minN?'insightbelow':''}"><td>${x.n>=minN?i+1:'—'}</td><td><strong>${esc(x.agency)}</strong></td><td><span class="struct-tag">${x.archetype}</span></td><td><span class="dna-tag ${dnaClass(x)}">${x.dna}</span></td><td><strong>${x.total}</strong></td><td>${x.avg.toFixed(2)}</td><td>${x.n}</td><td class="${x.depth>=70?'metricgood':''}">${x.depth.toFixed(1)}%</td><td>${x.ace.toFixed(1)}%</td><td>${x.breakthroughTeams} / ${x.breakRate.toFixed(1)}%</td><td class="${x.retEligible<3?'metricsoft':''}">${x.retEligible?x.retention.toFixed(1)+'% ('+x.retEligible+')':'—'}</td><td>${x.crossRate.toFixed(1)}%</td></tr>`).join('')}</tbody></table>`;
    draw(rows);
  }
  function hitAt(e){const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;return hits.find(p=>Math.hypot(x-p.x,y-p.y)<=p.r)}
  canvas.addEventListener('pointermove',e=>{const p=hitAt(e);if(!p){tip.classList.remove('show');return}const b=canvas.parentElement.getBoundingClientRect(),x=p.row;tip.innerHTML=`<b>${esc(x.agency)}</b><br>${x.archetype} / ${x.dna}<br>AVG ${x.avg.toFixed(2)} ／ n=${x.n}<br>DEPTH ${x.depth.toFixed(1)}% ／ TOP1 ${x.ace.toFixed(1)}%`;tip.style.left=Math.min(e.clientX-b.left+10,b.width-210)+'px';tip.style.top=(e.clientY-b.top+8)+'px';tip.classList.add('show')});canvas.addEventListener('pointerleave',()=>tip.classList.remove('show'));
  rangeEl.addEventListener('change',render);minEl.addEventListener('change',render);
  document.getElementById('insightCsv').addEventListener('click',()=>{const rows=data(),minN=+minEl.value,[a,b]=bounds(),out=[['期間','事務所','ARCHETYPE','DNA','POWER','AVG','n','DEPTH','TOP1_DEPENDENCY','BREAKTHROUGH_COUNT','BREAKTHROUGH_RATE','RETENTION_RATE','RETENTION_N','CROSSOVER_RATE','QUALIFIED']];for(const x of rows)out.push([`${a}-${b}`,x.agency,x.archetype,x.dna,x.total,x.avg.toFixed(3),x.n,x.depth.toFixed(1),x.ace.toFixed(1),x.breakthroughTeams,x.breakRate.toFixed(1),x.retEligible?x.retention.toFixed(1):'',x.retEligible,x.crossRate.toFixed(1),x.n>=minN?'YES':'NO']);const csv=out.map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\r\n'),blob=new Blob(['\uFEFF'+csv],{type:'text/csv'}),u=URL.createObjectURL(blob),ael=document.createElement('a');ael.href=u;ael.download=`agency_insights_${a}_${b}_v220.csv`;ael.click();URL.revokeObjectURL(u)});
  let rt;addEventListener('resize',()=>{if(root.hidden)return;clearTimeout(rt);rt=setTimeout(render,140)});
  render();window.M1KOC_RENDER_AGENCY_INSIGHTS=render;window.M1KOC_AGENCY_INSIGHTS={version:'v220',default_min_n:5,metrics:['depth','ace_dependency','breakthrough','retention','crossover','dna','archetype']};window.M1KOC_CHECKPOINT={...(window.M1KOC_CHECKPOINT||{}),version:'v220',focus:'agency archetypes / roster depth / breakthrough / retention',checked_at:'2026-09-14'};
})();


/* v222 agency visuals + clickable focus */
(()=>{
  const root=document.getElementById('agencyVisuals');
  if(!root)return;
  const contestEl=document.getElementById('visualContest'),rangeEl=document.getElementById('visualRange'),summary=document.getElementById('visualSummary');
  const landscape=document.getElementById('visualLandscape'),landTip=document.getElementById('visualLandscapeTip');
  const dominance=document.getElementById('visualDominance'),heatmap=document.getElementById('visualHeatmap');
  const focusChart=document.getElementById('visualFocusChart'),focusStats=document.getElementById('visualFocusStats'),focusList=document.getElementById('visualFocusList'),focusChip=document.getElementById('visualFocusChip'),focusMeta=document.getElementById('visualFocusMeta');
  const stageKey=v=>/優勝/.test(v)?'win':/^決勝/.test(v)?'final':/準決勝/.test(v)?'sf':/準々決勝/.test(v)?'qf':/3回戦|３回戦/.test(v)?'r3':'';
  const score=v=>({r3:1,qf:2,sf:3,final:5,win:15})[stageKey(v)]||0;
  const agencyCanonical=d=>{let k=d.agency_key||d.agency||'';if(k==='mixed')return'複数所属';if(k==='サンミュージック')return'サンミュージックプロダクション';if(k==='SMA NEET PROJECT')return'SMA';return k};
  const bounds=()=>rangeEl.value==='modern'?[2015,2025]:rangeEl.value==='both'?[2008,2025]:[2001,2025];
  const contests=()=>contestEl.value==='combined'?['m1','koc']:[contestEl.value];
  const inRange=y=>{const [a,b]=bounds();return +y>=a&&+y<=b};
  const dnaOf=(m1,koc)=>contestEl.value==='m1'?'漫才寄り':contestEl.value==='koc'?'コント寄り':(m1+koc)?(m1/(m1+koc)>=.65?'漫才寄り':m1/(m1+koc)<=.35?'コント寄り':'二刀流'):'二刀流';
  const colorFor=dna=>contestEl.value==='m1'?'rgba(239,90,84,.58)':contestEl.value==='koc'?'rgba(107,165,223,.58)':dna==='漫才寄り'?'rgba(239,90,84,.58)':dna==='コント寄り'?'rgba(107,165,223,.58)':'rgba(223,188,104,.60)';
  let selectedAgency='';
  function agencyRows(){
    const by=new Map();
    for(const d of DB){
      if(!d.agency_verified||!d.agency)continue;
      let m1=0,koc=0,has=false;
      for(const [y,v] of Object.entries(d.m1||{})){ if(inRange(y)){ const pt=score(v); if(pt){m1+=pt; if(contests().includes('m1')) has=true;} } }
      for(const [y,v] of Object.entries(d.koc||{})){ if(inRange(y)){ const pt=score(v); if(pt){koc+=pt; if(contests().includes('koc')) has=true;} } }
      const total=contestEl.value==='m1'?m1:(contestEl.value==='koc'?koc:m1+koc);
      if(!total&&!has)continue;
      const a=agencyCanonical(d);
      if(!by.has(a))by.set(a,{agency:a,n:0,total:0,m1:0,koc:0,teams:[]});
      const row=by.get(a); row.n++; row.total+=total; row.m1+=m1; row.koc+=koc; row.teams.push({name:d.name,total,m1,koc});
    }
    return [...by.values()].map(r=>({...r,avg:r.n?r.total/r.n:0,dna:dnaOf(r.m1,r.koc)})).sort((a,b)=>b.total-a.total||b.avg-a.avg||b.n-a.n||a.agency.localeCompare(b.agency,'ja'));
  }
  function yearlyData(){
    const [a,b]=bounds(), years=[]; for(let y=a;y<=b;y++)years.push(y);
    return years.map(y=>{
      const byAgency=new Map();
      for(const d of DB){
        if(!d.agency_verified||!d.agency)continue; const agency=agencyCanonical(d); let pt=0;
        for(const c of contests()){ const obj=(c==='m1'?d.m1:d.koc)||{}; if(obj[String(y)]) pt+=score(obj[String(y)]); }
        if(!pt)continue; byAgency.set(agency,(byAgency.get(agency)||0)+pt);
      }
      const rows=[...byAgency.entries()].map(([agency,total])=>({agency,total})).sort((x,y)=>y.total-x.total||x.agency.localeCompare(y.agency,'ja'));
      const total=rows.reduce((s,x)=>s+x.total,0);
      return {year:y,rows,total,top1:total?(rows[0]?.total||0)/total*100:0,top3:total?rows.slice(0,3).reduce((s,x)=>s+x.total,0)/total*100:0,agencies:rows.length};
    }).filter(x=>x.total>0);
  }
  function focusData(agency){
    if(!agency) return null;
    const [a,b]=bounds(), years=[]; for(let y=a;y<=b;y++)years.push(y);
    const members=[];
    const ptsByTeam=new Map();
    years.forEach(y=>0);
    const series=years.map(y=>({year:y,m1:0,koc:0,total:0}));
    for(const d of DB){
      if(!d.agency_verified||agencyCanonical(d)!==agency) continue;
      let teamTotal=0, teamM1=0, teamKoc=0;
      years.forEach((y,idx)=>{ let m=0,k=0; if(d.m1?.[String(y)]) m=score(d.m1[String(y)]); if(d.koc?.[String(y)]) k=score(d.koc[String(y)]); series[idx].m1+=m; series[idx].koc+=k; series[idx].total+= contestEl.value==='m1'?m:(contestEl.value==='koc'?k:m+k); teamM1+=m; teamKoc+=k; teamTotal += contestEl.value==='m1'?m:(contestEl.value==='koc'?k:m+k); });
      if(teamTotal>0){ members.push(d.name); ptsByTeam.set(d.name,{name:d.name,total:teamTotal,m1:teamM1,koc:teamKoc}); }
    }
    const topTeams=[...ptsByTeam.values()].sort((x,y)=>y.total-x.total||x.name.localeCompare(y.name,'ja')).slice(0,5);
    const total=series.reduce((s,x)=>s+x.total,0), n=ptsByTeam.size, avg=n?total/n:0;
    let best=series.reduce((best,x)=>x.total>(best?.total||-1)?x:best,null);
    const m1=series.reduce((s,x)=>s+x.m1,0), koc=series.reduce((s,x)=>s+x.koc,0), dna=dnaOf(m1,koc);
    return {agency,series:series.filter(x=>x.total>0||x.m1>0||x.koc>0),total,n,avg,m1,koc,dna,best,bestShare:total&&best?best.total/total*100:0,topTeams};
  }
  let landscapeHits=[];
  function drawLandscape(rows){
    const r=landscape.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1),w=Math.max(320,r.width||320),h=Math.max(280,r.height||320); landscape.width=w*dpr; landscape.height=h*dpr; const ctx=landscape.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h); landscapeHits=[];
    const shown=rows.slice(0,24),pad={l:42,r:18,t:18,b:34},pw=w-pad.l-pad.r,ph=h-pad.t-pad.b,maxN=Math.max(1,...shown.map(x=>x.n)),maxA=Math.max(1,...shown.map(x=>x.avg)),maxT=Math.max(1,...shown.map(x=>x.total)); ctx.font='8px Arial'; ctx.textBaseline='middle';
    for(let i=0;i<=4;i++){ const yy=pad.t+ph-ph*i/4; ctx.strokeStyle='rgba(55,50,44,.14)'; ctx.beginPath(); ctx.moveTo(pad.l,yy); ctx.lineTo(w-pad.r,yy); ctx.stroke(); ctx.fillStyle='#777169'; ctx.textAlign='right'; ctx.fillText((maxA*i/4).toFixed(1),pad.l-6,yy);}
    for(let i=0;i<=4;i++){ const xx=pad.l+pw*i/4; ctx.strokeStyle='rgba(55,50,44,.09)'; ctx.beginPath(); ctx.moveTo(xx,pad.t); ctx.lineTo(xx,pad.t+ph); ctx.stroke(); ctx.fillStyle='#777169'; ctx.textAlign='center'; ctx.fillText(String(Math.round(maxN*i/4)),xx,h-pad.b+13);}
    ctx.fillStyle='#777169'; ctx.textAlign='left'; ctx.fillText('AVG',4,10); ctx.textAlign='right'; ctx.fillText('n',w-4,h-9);
    const labels=new Set(shown.slice(0,10).map(x=>x.agency));
    shown.forEach(x=>{ const cx=pad.l+(x.n/maxN)*pw, cy=pad.t+ph-(x.avg/maxA)*ph, rr=4+Math.sqrt(x.total/maxT)*12; const selected=x.agency===selectedAgency; ctx.fillStyle=colorFor(x.dna); ctx.strokeStyle=selected?'rgba(255,255,255,.92)':'rgba(235,237,240,.48)'; ctx.lineWidth=selected?2.2:1; ctx.beginPath(); ctx.arc(cx,cy,rr,0,Math.PI*2); ctx.fill(); ctx.stroke(); landscapeHits.push({x:cx,y:cy,r:rr+7,row:x}); if(labels.has(x.agency)||selected){ ctx.fillStyle=selected?'#111':'#403c37'; ctx.textAlign='left'; ctx.fillText(x.agency,cx+rr+4,cy);} });
    ctx.lineWidth=1;
  }
  function drawDominance(series){
    const r=dominance.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1),w=Math.max(320,r.width||320),h=Math.max(280,r.height||320); dominance.width=w*dpr; dominance.height=h*dpr; const ctx=dominance.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h); const pad={l:34,r:18,t:18,b:36},pw=w-pad.l-pad.r,ph=h-pad.t-pad.b,maxY=100; ctx.font='8px Arial'; ctx.textBaseline='middle';
    for(let i=0;i<=5;i++){const yy=pad.t+ph-ph*i/5; ctx.strokeStyle='rgba(55,50,44,.14)'; ctx.beginPath(); ctx.moveTo(pad.l,yy); ctx.lineTo(w-pad.r,yy); ctx.stroke(); ctx.fillStyle='#777169'; ctx.textAlign='right'; ctx.fillText(String(Math.round(maxY*i/5))+'%',pad.l-5,yy);}
    const xs=(idx)=> series.length<=1?pad.l+pw/2: pad.l+pw*(idx/(series.length-1));
    ;[0, Math.floor((series.length-1)/2), series.length-1].filter((v,i,a)=>v>=0&&a.indexOf(v)===i).forEach(i=>{const xx=xs(i); ctx.strokeStyle='rgba(55,50,44,.09)'; ctx.beginPath(); ctx.moveTo(xx,pad.t); ctx.lineTo(xx,pad.t+ph); ctx.stroke(); ctx.fillStyle='#777169'; ctx.textAlign='center'; ctx.fillText(String(series[i].year),xx,h-pad.b+13);});
    const line=(field,color)=>{ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();series.forEach((p,i)=>{const xx=xs(i),yy=pad.t+ph-(p[field]/maxY)*ph; i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)});ctx.stroke(); ctx.fillStyle=color; series.forEach((p,i)=>{const xx=xs(i),yy=pad.t+ph-(p[field]/maxY)*ph; ctx.beginPath(); ctx.arc(xx,yy,2.8,0,Math.PI*2); ctx.fill();});};
    if(series.length){ line('top3','#9bc3eb'); line('top1','#e4c878'); }
    ctx.lineWidth=1;
  }
  function renderHeatmap(rows,yearSeries){
    const years=yearSeries.map(x=>x.year), top=rows.slice(0,12), maxCell=Math.max(1,...top.flatMap(r=>years.map(y=>{const yd=yearSeries.find(s=>s.year===y);const m=yd?.rows.find(z=>z.agency===r.agency);return m?m.total:0;})));
    const accent=contestEl.value==='m1'?[239,90,84]:contestEl.value==='koc'?[107,165,223]:[223,188,104];
    const makeCell=v=>{const alpha=v?Math.max(.08,Math.min(.88,v/maxCell*.88)):0; const style=v?`background:rgba(${accent[0]},${accent[1]},${accent[2]},${alpha.toFixed(3)});`:''; return [style, v?String(v):'—'];};
    heatmap.innerHTML=`<table class="visualheat"><thead><tr><th>事務所</th>${years.map(y=>`<th>${y}</th>`).join('')}</tr></thead><tbody>${top.map(r=>`<tr data-agency="${esc(r.agency)}" class="${r.agency===selectedAgency?'isfocus':''}"><td><span class="agencyname">${esc(r.agency)}</span><span class="sub">${r.total}pt / n=${r.n}</span></td>${years.map(y=>{const yd=yearSeries.find(s=>s.year===y);const m=yd?.rows.find(z=>z.agency===r.agency);const v=m?m.total:0;const [style,label]=makeCell(v);const best=yd?.rows[0]?.agency===r.agency?' topyear':'';return `<td class="${v?'' :'zero'}${best}" style="${style}">${label}</td>`;}).join('')}</tr>`).join('')}</tbody></table>`;
    heatmap.querySelectorAll('tbody tr[data-agency]').forEach(tr=>tr.addEventListener('click',()=>{selectedAgency=tr.dataset.agency;render();}));
  }
  function drawFocus(focus){
    const r=focusChart.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1),w=Math.max(320,r.width||320),h=Math.max(280,r.height||300); focusChart.width=w*dpr; focusChart.height=h*dpr; const ctx=focusChart.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
    if(!focus||!focus.series.length){ ctx.fillStyle='#80838a'; ctx.font='10px Arial'; ctx.textAlign='center'; ctx.fillText('事務所を選択すると年次推移を表示します',w/2,h/2); return; }
    const series=focus.series, pad={l:34,r:18,t:18,b:36}, pw=w-pad.l-pad.r, ph=h-pad.t-pad.b, maxY=Math.max(1,...series.map(x=>contestEl.value==='combined'?x.total:(contestEl.value==='m1'?x.m1:x.koc))); ctx.font='8px Arial'; ctx.textBaseline='middle';
    for(let i=0;i<=4;i++){ const yy=pad.t+ph-ph*i/4; ctx.strokeStyle='rgba(55,50,44,.14)'; ctx.beginPath(); ctx.moveTo(pad.l,yy); ctx.lineTo(w-pad.r,yy); ctx.stroke(); ctx.fillStyle='#777169'; ctx.textAlign='right'; ctx.fillText((maxY*i/4).toFixed(0),pad.l-5,yy); }
    const bw=Math.max(8, Math.min(24, (pw/Math.max(1,series.length))*0.6)); const xs=(idx)=>pad.l + (series.length<=1?pw/2:pw*(idx/(series.length-1)));
    series.forEach((p,i)=>{ const x=xs(i); const base=pad.t+ph; if(contestEl.value==='combined'){ const hm=ph*(p.m1/maxY), hk=ph*(p.koc/maxY); if(hm){ctx.fillStyle='rgba(239,90,84,.72)'; ctx.fillRect(x-bw/2, base-hm, bw, hm);} if(hk){ctx.fillStyle='rgba(107,165,223,.72)'; ctx.fillRect(x-bw/2, base-hm-hk, bw, hk);} } else { const val=contestEl.value==='m1'?p.m1:p.koc, hh=ph*(val/maxY); ctx.fillStyle=contestEl.value==='m1'?'rgba(239,90,84,.76)':'rgba(107,165,223,.76)'; if(hh) ctx.fillRect(x-bw/2, base-hh, bw, hh);} });
    const totalLine=series.map(p=>({year:p.year,val:contestEl.value==='m1'?p.m1:contestEl.value==='koc'?p.koc:p.total})); ctx.strokeStyle='rgba(223,188,104,.95)'; ctx.lineWidth=1.6; ctx.beginPath(); totalLine.forEach((p,i)=>{ const x=xs(i), y=pad.t+ph-(p.val/maxY)*ph; i?ctx.lineTo(x,y):ctx.moveTo(x,y);}); ctx.stroke(); ctx.fillStyle='rgba(223,188,104,.95)'; totalLine.forEach((p,i)=>{ const x=xs(i), y=pad.t+ph-(p.val/maxY)*ph; ctx.beginPath(); ctx.arc(x,y,2.2,0,Math.PI*2); ctx.fill(); });
    [0, Math.floor((series.length-1)/2), series.length-1].filter((v,i,a)=>v>=0&&a.indexOf(v)===i).forEach(i=>{ const x=xs(i); ctx.fillStyle='#777169'; ctx.textAlign='center'; ctx.fillText(String(series[i].year),x,h-pad.b+13); }); ctx.lineWidth=1;
  }
  function renderFocus(focus){
    drawFocus(focus);
    if(!focus){ focusChip.textContent='NO AGENCY SELECTED'; focusMeta.textContent='点または行をクリックしてください'; focusStats.innerHTML='<div class="focusempty">LANDSCAPE または HEATMAP から事務所を選択してください</div>'; focusList.innerHTML=''; return; }
    focusChip.textContent=focus.agency; focusMeta.textContent=`${focus.dna} / ${bounds()[0]}–${bounds()[1]} / ${contestEl.value==='combined'?'M-1 + KOC':contestEl.value.toUpperCase()}`;
    const stat=(k,v,s='')=>`<div class="focusstat"><span>${k}</span><b>${v}</b>${s?`<small>${s}</small>`:''}</div>`;
    focusStats.innerHTML=stat('POWER',focus.total+'pt',`M-1 ${focus.m1} / KOC ${focus.koc}`)+stat('AVERAGE',focus.avg.toFixed(2),`収録ユニット ${focus.n}組`)+stat('BEST YEAR',focus.best?focus.best.year:'—',focus.best?`${focus.best.total}pt / 全体の${focus.bestShare.toFixed(1)}%`:'' )+stat('DNA',focus.dna,'クリック選択中の詳細ビュー');
    focusList.innerHTML=`<b>TOP CONTRIBUTORS</b>${focus.topTeams.length?`<ol>${focus.topTeams.map(t=>`<li><button type="button" class="focus-team-link" data-team="${encodeURIComponent(t.name)}">${esc(t.name)}</button><span>${t.total}pt${contestEl.value==='combined'?` / M-1 ${t.m1}・KOC ${t.koc}`:''}</span></li>`).join('')}</ol>`:'<div class="focusempty" style="min-height:120px">該当ユニットがありません</div>'}`;
    focusList.querySelectorAll('.focus-team-link').forEach(btn=>btn.addEventListener('click',()=>{const name=decodeURIComponent(btn.dataset.team||'');if(name&&typeof window.M1KOC_OPEN_DETAIL==='function')window.M1KOC_OPEN_DETAIL(name)}));
  }
  function ensureSelection(rows){
    if(selectedAgency && rows.some(r=>r.agency===selectedAgency)) return;
    selectedAgency = rows[0]?.agency || '';
  }
  function render(){
    const rows=agencyRows(), years=yearlyData(); ensureSelection(rows); const focus=focusData(selectedAgency); const [a,b]=bounds();
    const leader=rows[0], quality=[...rows].sort((x,y)=>y.avg-x.avg||y.total-x.total)[0], deep=[...rows].sort((x,y)=>y.n-x.n||y.total-x.total)[0], dense=years.length?[...years].sort((x,y)=>y.top3-x.top3)[0]:null;
    summary.innerHTML=`<div class="evosum"><span>MODE</span><b>${contestEl.value==='combined'?'M-1 + KOC':contestEl.value.toUpperCase()}</b></div><div class="evosum"><span>PERIOD</span><b>${a}–${b}</b></div><div class="evosum"><span>POWER LEADER</span><b>${leader?esc(leader.agency)+' / '+leader.total+'pt':'—'}</b></div><div class="evosum"><span>HIGHEST AVG</span><b>${quality?esc(quality.agency)+' / '+quality.avg.toFixed(2):'—'}</b></div><div class="evosum"><span>BIGGEST ROSTER</span><b>${deep?esc(deep.agency)+' / n='+deep.n:'—'}</b></div><div class="evosum"><span>PEAK DOMINANCE</span><b>${dense?dense.year+' / TOP3 '+dense.top3.toFixed(1)+'%':'—'}</b></div>`;
    drawLandscape(rows); drawDominance(years); renderHeatmap(rows,years); renderFocus(focus);
  }
  function hitAt(e){ const r=landscape.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top; return landscapeHits.find(p=>Math.hypot(x-p.x,y-p.y)<=p.r); }
  landscape.addEventListener('pointermove',e=>{ const p=hitAt(e); if(!p){ landTip.classList.remove('show'); return; } const b=landscape.parentElement.getBoundingClientRect(),x=p.row; landTip.innerHTML=`<b>${esc(x.agency)}</b><br>${x.dna}<br>POWER ${x.total}pt ／ AVG ${x.avg.toFixed(2)}<br>n=${x.n} ／ M-1 ${x.m1} / KOC ${x.koc}<br><span style="color:#8d9097">クリックで詳細</span>`; landTip.style.left=Math.min(e.clientX-b.left+10,b.width-220)+'px'; landTip.style.top=(e.clientY-b.top+8)+'px'; landTip.classList.add('show'); });
  landscape.addEventListener('pointerleave',()=>landTip.classList.remove('show'));
  landscape.addEventListener('click',e=>{ const p=hitAt(e); if(!p) return; selectedAgency=p.row.agency; render(); const box=document.getElementById('visualFocusChart'); box?.scrollIntoView({behavior:'smooth',block:'center'}); });
  contestEl.addEventListener('change',render); rangeEl.addEventListener('change',render);
  let rt; addEventListener('resize',()=>{ if(root.hidden) return; clearTimeout(rt); rt=setTimeout(render,140); });
  render(); window.M1KOC_RENDER_AGENCY_VISUALS=render; window.M1KOC_AGENCY_VISUALS={version:'v223',views:['landscape','dominance_timeline','yearly_heatmap','agency_focus'],click_to_focus:true,contributor_detail_links:true}; window.M1KOC_CHECKPOINT={...(window.M1KOC_CHECKPOINT||{}),version:'v223',focus:'agency visuals + clickable contributor detail links',checked_at:'2026-09-14'};
})();


/* v224 discovery lab */
(()=>{
  const root=document.getElementById('discoveryRoot'); if(!root)return;
  const tabs=[...document.querySelectorAll('[data-discovery-tab]')], panels=[...document.querySelectorAll('[data-discovery-panel]')], hint=document.getElementById('discoveryHint');
  const info={
    generation:{hint:'結成年ごとに、どの世代が厚く・強いかを可視化します。',title:'GENERATION',html:'<p><b>結成年</b>を3年帯でまとめ、平均POWER・準決勝以上率・決勝到達率を比較します。世代の厚さと到達力を同時に見るためのビューです。</p>'},
    momentum:{hint:'直近3年と、その前3年を比べて「最近伸びている組」を見ます。',title:'MOMENTUM',html:'<p><b>MOMENTUM</b>は未来予測ではありません。直近3大会年の加重POWERと、その前3大会年の加重POWERとの差を使い、最近の上昇・下降を可視化します。</p>'},
    path:{hint:'初決勝の1〜3年前に、どこまで来ていたかを集計します。',title:'PATH TO FINAL',html:'<p>各ユニットの<b>初決勝年</b>を起点に、その1〜3年前の到達ラウンドを集計します。「QF→SF→決勝」のような典型ルートがどれくらい多いかを見ます。</p>'},
    crossover:{hint:'M-1とKOCの両方で強い“二刀流”を可視化します。',title:'CROSSOVER',html:'<p>横軸にM-1 POWER、縦軸にKOC POWERを置き、両大会の強さを同時に比較します。右上ほど、漫才・コントの双方で実績が高いユニットです。</p>'},
    forecast:{hint:'実績重視 ↔ 新星重視を動かして、決勝候補10組をシミュレーションします。',title:'FINALIST FORECAST',html:'<p><b>FORECAST</b>は未来を断定するものではなく、前年までのDB戦績だけで候補順位を動かすシミュレーションです。左ほど累積実績・決勝/SF継続、右ほど直近モメンタム・初決勝余地・若手性を強く評価します。2026年の既知結果は計算から除外します。</p>'}
  };
  let current='generation';
  function showHelp(all=false){ const t=info[current]; dialogTitle.textContent=all?'DISCOVERY GUIDE':t.title; dialogContent.innerHTML=all?Object.values(info).map(x=>`<section class="dialogsection"><h3>${x.title}</h3>${x.html}</section>`).join(''):`<section class="dialogsection"><h3>${t.title}</h3>${t.html}</section>`; infoDialog.showModal(); }
  function setTab(name){ current=name; tabs.forEach(b=>{const on=b.dataset.discoveryTab===name;b.classList.toggle('on',on);b.setAttribute('aria-selected',on?'true':'false')}); panels.forEach(p=>p.hidden=p.dataset.discoveryPanel!==name); hint.textContent=info[name].hint; requestAnimationFrame(()=>renderCurrent()); try{sessionStorage.setItem('m1kocDiscoveryTab',name)}catch(e){} }
  document.getElementById('discoveryGuide')?.addEventListener('click',()=>showHelp(true)); document.getElementById('discoveryHelp')?.addEventListener('click',()=>showHelp(false)); root.querySelector('#discoveryTabs')?.addEventListener('click',e=>{const b=e.target.closest('[data-discovery-tab]');if(b)setTab(b.dataset.discoveryTab)});
  const sk=v=>/優勝/.test(v)?'win':/^決勝/.test(v)?'final':/準決勝/.test(v)?'sf':/準々決勝/.test(v)?'qf':/3回戦|３回戦/.test(v)?'r3':'';
  const pt=v=>({r3:1,qf:2,sf:3,final:5,win:15})[sk(v)]||0;
  const rv=v=>({r3:1,qf:2,sf:3,final:4,win:5})[sk(v)]||0;
  const stage=v=>({r3:'3回戦',qf:'QF',sf:'SF',final:'決勝',win:'優勝'})[sk(v)]||'—';
  const contestObjs=(d,c)=>c==='combined'?[d.m1||{},d.koc||{}]:[c==='m1'?(d.m1||{}):(d.koc||{})];
  const totalPower=(d,c)=>contestObjs(d,c).reduce((s,o)=>s+Object.values(o).reduce((a,v)=>a+pt(v),0),0);
  const maxRank=(d,c)=>contestObjs(d,c).reduce((m,o)=>Math.max(m,...Object.values(o).map(rv),0),0);
  function openName(name){ if(typeof openD==='function')openD(name); }
  const wireNames=scope=>scope.querySelectorAll('[data-name]').forEach(el=>el.addEventListener('click',()=>openName(el.dataset.name)));

  // GENERATION
  function renderGeneration(){
    const c=document.getElementById('genContest').value, rows=DB.map(d=>{const fy=+d.formed;if(!fy)return null;const p=totalPower(d,c),r=maxRank(d,c);if(!p)return null;return{d,fy,p,r}}).filter(Boolean);
    const min=Math.floor(Math.min(...rows.map(x=>x.fy))/3)*3, max=Math.max(...rows.map(x=>x.fy)); const cohorts=[];
    for(let y=min;y<=max;y+=3){const xs=rows.filter(x=>x.fy>=y&&x.fy<=y+2);if(!xs.length)continue;const n=xs.length,total=xs.reduce((s,x)=>s+x.p,0),avg=total/n,sf=xs.filter(x=>x.r>=3).length,fin=xs.filter(x=>x.r>=4).length;cohorts.push({label:`${y}–${y+2}`,start:y,n,total,avg,sfRate:sf/n*100,finalRate:fin/n*100});}
    const chart=document.getElementById('generationChart'), r=chart.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1),w=Math.max(300,r.width||300),h=Math.max(260,r.height||300);chart.width=w*dpr;chart.height=h*dpr;const ctx=chart.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const top=cohorts.slice(-14),pad={l:36,r:10,t:12,b:56},pw=w-pad.l-pad.r,ph=h-pad.t-pad.b,maxA=Math.max(1,...top.map(x=>x.avg));ctx.font='8px Arial';
    top.forEach((x,i)=>{const bw=pw/top.length*.62,xx=pad.l+(i+.5)*pw/top.length,hh=ph*x.avg/maxA;ctx.fillStyle='rgba(223,188,104,.68)';ctx.fillRect(xx-bw/2,pad.t+ph-hh,bw,hh);ctx.fillStyle='#6f7279';ctx.textAlign='center';ctx.save();ctx.translate(xx,h-8);ctx.rotate(-.7);ctx.fillText(x.label,0,0);ctx.restore()});
    for(let i=0;i<=4;i++){const yy=pad.t+ph-ph*i/4;ctx.strokeStyle='rgba(55,50,44,.14)';ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(w-pad.r,yy);ctx.stroke();ctx.fillStyle='#777169';ctx.textAlign='right';ctx.fillText((maxA*i/4).toFixed(1),pad.l-5,yy)}
    const best=[...cohorts].sort((a,b)=>b.avg-a.avg)[0],deep=[...cohorts].sort((a,b)=>b.n-a.n)[0],sf=[...cohorts].sort((a,b)=>b.sfRate-a.sfRate)[0],fin=[...cohorts].sort((a,b)=>b.finalRate-a.finalRate)[0]; const card=(k,x,v,s)=>`<div class="discovercard"><span>${k}</span><b>${x?x.label:'—'}</b><small>${x?v(x):'—'}${x&&s?` / ${s(x)}`:''}</small></div>`; document.getElementById('generationCards').innerHTML=card('HIGHEST AVG',best,x=>x.avg.toFixed(2)+' pt',x=>'n='+x.n)+card('BIGGEST COHORT',deep,x=>'n='+x.n,x=>x.total+'pt')+card('SF+ RATE',sf,x=>x.sfRate.toFixed(1)+'%',x=>'n='+x.n)+card('FINAL RATE',fin,x=>x.finalRate.toFixed(1)+'%',x=>'n='+x.n);
    const maxV=Math.max(1,...cohorts.map(x=>x.avg));document.getElementById('generationTable').innerHTML=`<table class="generationtable"><thead><tr><th>結成年帯</th><th>n</th><th>総POWER</th><th>平均</th><th>SF+率</th><th>決勝率</th></tr></thead><tbody>${[...cohorts].reverse().map(x=>`<tr><td><strong>${x.label}</strong></td><td>${x.n}</td><td>${x.total}</td><td style="background:rgba(223,188,104,${Math.max(.03,x.avg/maxV*.42).toFixed(3)})">${x.avg.toFixed(2)}</td><td>${x.sfRate.toFixed(1)}%</td><td>${x.finalRate.toFixed(1)}%</td></tr>`).join('')}</tbody></table>`;
  }

  // MOMENTUM
  function contestYears(c){const set=new Set();DB.forEach(d=>contestObjs(d,c).forEach(o=>Object.keys(o).forEach(y=>set.add(+y))));return [...set].filter(Boolean).sort((a,b)=>a-b)}
  function renderMomentum(){
    const c=document.getElementById('momentumContest').value, ys=contestYears(c), recent=ys.slice(-3), prev=ys.slice(-6,-3);
    const scoreWindow=(d,years)=>{if(!years.length)return 0;let vals=years.map((y,i)=>{let s=0;contestObjs(d,c).forEach(o=>{if(o[String(y)])s+=pt(o[String(y)])});return{s,w:i+1}});const ws=vals.reduce((a,x)=>a+x.w,0);return vals.reduce((a,x)=>a+x.s*x.w,0)/ws};
    const rows=DB.map(d=>{const now=scoreWindow(d,recent),before=scoreWindow(d,prev),m=now-before,total=totalPower(d,c);return{name:d.name,now,before,m,total}}).filter(x=>x.now>0||x.before>0).sort((a,b)=>b.m-a.m||b.now-a.now||b.total-a.total); const top=rows.slice(0,20);
    const chart=document.getElementById('momentumChart'),r=chart.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1),w=Math.max(300,r.width||300),h=Math.max(260,r.height||300);chart.width=w*dpr;chart.height=h*dpr;const ctx=chart.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const shown=top.slice(0,12),pad={l:100,r:18,t:10,b:18},ph=h-pad.t-pad.b,maxM=Math.max(1,...shown.map(x=>Math.max(0,x.m)));ctx.font='8px Arial';shown.forEach((x,i)=>{const y=pad.t+(i+.5)*ph/shown.length,bh=Math.max(3,ph/shown.length*.48),bw=(w-pad.l-pad.r)*Math.max(0,x.m)/maxM;ctx.fillStyle='rgba(223,188,104,.75)';ctx.fillRect(pad.l,y-bh/2,bw,bh);ctx.fillStyle='#403c37';ctx.textAlign='right';ctx.fillText(x.name,pad.l-6,y);ctx.textAlign='left';ctx.fillStyle='#777169';ctx.fillText('+'+x.m.toFixed(2),pad.l+bw+5,y)});
    const riser=rows[0], active=[...rows].sort((a,b)=>b.now-a.now)[0],comeback=rows.filter(x=>x.before===0&&x.now>0).sort((a,b)=>b.now-a.now)[0],cool=[...rows].sort((a,b)=>a.m-b.m)[0];const card=(k,x,v)=>`<div class="discovercard" ${x?`data-name="${esc(x.name)}"`:''}><span>${k}</span><b>${x?esc(x.name):'—'}</b><small>${x?v(x):'—'}</small></div>`;const cards=document.getElementById('momentumCards');cards.innerHTML=card('HOTTEST',riser,x=>`Δ +${x.m.toFixed(2)}`)+card('CURRENT POWER',active,x=>`直近 ${x.now.toFixed(2)}`)+card('NEW / RETURN',comeback,x=>`直近 ${x.now.toFixed(2)}`)+card('COOLING',cool,x=>`Δ ${x.m.toFixed(2)}`);wireNames(cards);
    const wrap=document.getElementById('momentumTable');wrap.innerHTML=`<table class="discoverlist"><thead><tr><th>#</th><th>ユニット</th><th>MOMENTUM</th><th>直近3</th><th>前3</th><th>累積POWER</th></tr></thead><tbody>${rows.slice(0,40).map((x,i)=>`<tr data-name="${esc(x.name)}"><td>${i+1}</td><td><strong>${esc(x.name)}</strong></td><td><span class="metricpill ${x.m>0?'hot':x.m<0?'cool':''}">${x.m>=0?'+':''}${x.m.toFixed(2)}</span></td><td>${x.now.toFixed(2)}</td><td>${x.before.toFixed(2)}</td><td>${x.total}</td></tr>`).join('')}</tbody></table>`;wireNames(wrap);
  }

  // PATH
  function renderPath(){
    const c=document.getElementById('pathContest').value, years=contestYears(c), yset=new Set(years); const rows=[];
    DB.forEach(d=>{const o=c==='m1'?(d.m1||{}):(d.koc||{}), finals=Object.entries(o).filter(([y,v])=>rv(v)>=4).map(([y])=>+y).sort((a,b)=>a-b);if(!finals.length)return;const fy=finals[0], get=(back)=>{let y=fy-back;return yset.has(y)?(o[String(y)]||null):null}; rows.push({name:d.name,finalYear:fy,p1:get(1),p2:get(2),p3:get(3),formed:+d.formed||null});});
    const prev1=rows.map(x=>stage(x.p1)), counts={};prev1.forEach(s=>counts[s]=(counts[s]||0)+1);const total=rows.length;const ranked=Object.entries(counts).sort((a,b)=>b[1]-a[1]);document.getElementById('pathBars').innerHTML=ranked.map(([s,n])=>`<div class="pathrow"><b>${s}</b><div class="pathbar"><i style="width:${total?n/total*100:0}%"></i></div><span>${n} / ${total}</span></div>`).join('');
    const formedRows=rows.filter(x=>x.formed&&x.finalYear>=x.formed), ages=formedRows.map(x=>x.finalYear-x.formed), avgAge=ages.length?ages.reduce((a,b)=>a+b,0)/ages.length:0, med=ages.length?[...ages].sort((a,b)=>a-b)[Math.floor(ages.length/2)]:0, direct=rows.filter(x=>!x.p1||rv(x.p1)<2).length, sfprev=rows.filter(x=>rv(x.p1)>=3).length;document.getElementById('pathCards').innerHTML=`<div class="discovercard"><span>FIRST FINALISTS</span><b>${rows.length}組</b><small>${c.toUpperCase()} 収録範囲</small></div><div class="discovercard"><span>AVG YEARS FROM FORMATION</span><b>${avgAge.toFixed(1)}年</b><small>中央値 ${med}年 / n=${ages.length}</small></div><div class="discovercard"><span>SF+ PREVIOUS YEAR</span><b>${total?(sfprev/total*100).toFixed(1):'0.0'}%</b><small>${sfprev} / ${total}</small></div><div class="discovercard"><span>NO QF+ PREVIOUS YEAR</span><b>${total?(direct/total*100).toFixed(1):0}%</b><small>${direct} / ${total}</small></div>`;
    // histogram years from formation to first final
    const chart=document.getElementById('pathChart'),r=chart.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1),w=Math.max(300,r.width||300),h=Math.max(260,r.height||300);chart.width=w*dpr;chart.height=h*dpr;const ctx=chart.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const bins=new Map();ages.forEach(a=>bins.set(a,(bins.get(a)||0)+1));const xs=[...bins.keys()].sort((a,b)=>a-b),maxN=Math.max(1,...bins.values()),pad={l:32,r:10,t:12,b:30},pw=w-pad.l-pad.r,ph=h-pad.t-pad.b;ctx.font='8px Arial';xs.forEach((a,i)=>{const bw=Math.max(4,pw/Math.max(1,xs.length)*.64),xx=pad.l+(i+.5)*pw/Math.max(1,xs.length),hh=ph*bins.get(a)/maxN;ctx.fillStyle='rgba(223,188,104,.72)';ctx.fillRect(xx-bw/2,pad.t+ph-hh,bw,hh);ctx.fillStyle='#777169';ctx.textAlign='center';ctx.fillText(String(a),xx,h-8)});ctx.fillStyle='#777169';ctx.textAlign='left';ctx.fillText('結成→初決勝（年）',4,10);
    const wrap=document.getElementById('pathTable');wrap.innerHTML=`<table class="discoverlist"><thead><tr><th>ユニット</th><th>初決勝</th><th>前年</th><th>2年前</th><th>3年前</th><th>結成→初決勝</th></tr></thead><tbody>${rows.sort((a,b)=>b.finalYear-a.finalYear).map(x=>`<tr data-name="${esc(x.name)}"><td><strong>${esc(x.name)}</strong></td><td>${x.finalYear}</td><td>${stage(x.p1)}</td><td>${stage(x.p2)}</td><td>${stage(x.p3)}</td><td>${x.formed&&x.finalYear>=x.formed?(x.finalYear-x.formed)+'年':'—'}</td></tr>`).join('')}</tbody></table>`;wireNames(wrap);
  }

  // CROSSOVER
  let crossHits=[];
  function renderCrossover(){
    const min=+document.getElementById('crossMin').value, rows=DB.map(d=>{const m=totalPower(d,'m1'),k=totalPower(d,'koc'),t=m+k;if(t<min||!m||!k)return null;const balance=100-Math.abs(m-k)/t*100;return{name:d.name,m,k,t,balance}}).filter(Boolean).sort((a,b)=>b.t-a.t);
    const chart=document.getElementById('crossoverChart'),r=chart.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1),w=Math.max(300,r.width||300),h=Math.max(260,r.height||300);chart.width=w*dpr;chart.height=h*dpr;const ctx=chart.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);crossHits=[];const pad={l:36,r:12,t:12,b:32},pw=w-pad.l-pad.r,ph=h-pad.t-pad.b,maxM=Math.max(1,...rows.map(x=>x.m)),maxK=Math.max(1,...rows.map(x=>x.k));ctx.font='8px Arial';for(let i=0;i<=4;i++){const x=pad.l+pw*i/4,y=pad.t+ph-ph*i/4;ctx.strokeStyle='rgba(55,50,44,.14)';ctx.beginPath();ctx.moveTo(x,pad.t);ctx.lineTo(x,pad.t+ph);ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r,y);ctx.stroke()}const labels=new Set(rows.slice(0,8).map(x=>x.name));rows.forEach(x=>{const cx=pad.l+x.m/maxM*pw,cy=pad.t+ph-x.k/maxK*ph,rr=3+Math.sqrt(x.t/Math.max(1,rows[0]?.t||1))*7;ctx.fillStyle='rgba(223,188,104,.62)';ctx.strokeStyle='rgba(45,41,36,.38)';ctx.beginPath();ctx.arc(cx,cy,rr,0,Math.PI*2);ctx.fill();ctx.stroke();crossHits.push({x:cx,y:cy,r:rr+6,row:x});if(labels.has(x.name)){ctx.fillStyle='#403c37';ctx.textAlign='left';ctx.fillText(x.name,cx+rr+3,cy)}});ctx.fillStyle='#777169';ctx.textAlign='right';ctx.fillText('M-1 →',w-4,h-8);ctx.save();ctx.translate(8,15);ctx.rotate(-Math.PI/2);ctx.fillText('KOC →',0,0);ctx.restore();
    const balanced=[...rows].sort((a,b)=>b.balance-a.balance||b.t-a.t)[0],power=rows[0],m1=[...rows].sort((a,b)=>b.m-a.m)[0],koc=[...rows].sort((a,b)=>b.k-a.k)[0];const card=(k,x,v)=>`<div class="discovercard" ${x?`data-name="${esc(x.name)}"`:''}><span>${k}</span><b>${x?esc(x.name):'—'}</b><small>${x?v(x):'—'}</small></div>`;const cards=document.getElementById('crossoverCards');cards.innerHTML=card('DUAL POWER',power,x=>`${x.t}pt / M${x.m} K${x.k}`)+card('MOST BALANCED',balanced,x=>`BALANCE ${x.balance.toFixed(1)}`)+card('M-1 SIDE',m1,x=>`M-1 ${x.m}pt`)+card('KOC SIDE',koc,x=>`KOC ${x.k}pt`);wireNames(cards);const wrap=document.getElementById('crossoverTable');wrap.innerHTML=`<table class="discoverlist"><thead><tr><th>#</th><th>ユニット</th><th>合計</th><th>M-1</th><th>KOC</th><th>BALANCE</th></tr></thead><tbody>${rows.slice(0,50).map((x,i)=>`<tr data-name="${esc(x.name)}"><td>${i+1}</td><td><strong>${esc(x.name)}</strong></td><td>${x.t}</td><td>${x.m}</td><td>${x.k}</td><td>${x.balance.toFixed(1)}</td></tr>`).join('')}</tbody></table>`;wireNames(wrap);
  }
  document.getElementById('crossoverChart')?.addEventListener('pointermove',e=>{const c=e.currentTarget,r=c.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,p=crossHits.find(q=>Math.hypot(x-q.x,y-q.y)<=q.r),tip=document.getElementById('crossoverTip');if(!p){tip.classList.remove('show');return}const b=c.parentElement.getBoundingClientRect();tip.innerHTML=`<b>${esc(p.row.name)}</b><br>M-1 ${p.row.m} / KOC ${p.row.k}<br>合計 ${p.row.t} / BALANCE ${p.row.balance.toFixed(1)}`;tip.style.left=Math.min(e.clientX-b.left+8,b.width-200)+'px';tip.style.top=(e.clientY-b.top+8)+'px';tip.classList.add('show')});
  document.getElementById('crossoverChart')?.addEventListener('pointerleave',()=>document.getElementById('crossoverTip').classList.remove('show'));document.getElementById('crossoverChart')?.addEventListener('click',e=>{const r=e.currentTarget.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,p=crossHits.find(q=>Math.hypot(x-q.x,y-q.y)<=q.r);if(p)openName(p.row.name)});
  // FORECAST
  const forecastTargetYear=2026, forecastCutoffYear=2025;
  const fStageValue=v=>({r3:1,qf:2,sf:3,final:5,win:6})[sk(v)]||0;
  const clamp01=x=>Math.max(0,Math.min(1,x));
  function forecastRows(){
    const c=document.getElementById('forecastContest').value;
    const years=contestYears(c).filter(y=>y<=forecastCutoffYear), recent=years.slice(-3), prev=years.slice(-6,-3), rows=[];
    for(const d of DB){
      if(d.activity_status==='dissolved')continue;
      if(c==='m1' && (+d.formed||0) && +d.formed<2011)continue;
      const obj=(c==='m1'?d.m1:d.koc)||{}, entries=Object.entries(obj).filter(([y])=>+y<=forecastCutoffYear);
      if(!entries.length)continue;
      // FINALIST FORECAST excludes past champions of the selected contest.
      // A backtest must only know results available before its target year, so this
      // current-year view checks wins through the 2025 cutoff only.
      if(entries.some(([,v])=>sk(v)==='win'))continue;
      const total=entries.reduce((sum,[,v])=>sum+pt(v),0), finals=entries.filter(([,v])=>rv(v)>=4).length, sfs=entries.filter(([,v])=>rv(v)>=3).length, qfs=entries.filter(([,v])=>rv(v)>=2).length;
      const avg=(ys)=>ys.length?ys.reduce((sum,y)=>sum+fStageValue(obj[String(y)]),0)/ys.length:0;
      const recentAvg=avg(recent), prevAvg=avg(prev), momentum=recentAvg-prevAvg, lastYear=years.length?fStageValue(obj[String(years.at(-1))]):0;
      const streak=(level)=>{let n=0;for(let i=years.length-1;i>=0;i--){const v=obj[String(years[i])];if(v&&rv(v)>=level)n++;else break;}return n;};
      const sfStreak=streak(3),qfStreak=streak(2),formed=+d.formed||null,careerAge=formed?forecastTargetYear-formed:null,youth=careerAge==null?.45:clamp01((15-careerAge)/12),noFinal=finals===0?1:0;
      const finalYears=entries.filter(([,v])=>rv(v)>=4).map(([y])=>+y), finalGap=finalYears.length?forecastCutoffYear-Math.max(...finalYears):999, returnPotential=finals>0&&finalGap>=2?Math.min(1,finalGap/5):0;
      rows.push({name:d.name,total,finals,sfs,qfs,recentAvg,prevAvg,momentum,lastYear,sfStreak,qfStreak,formed,careerAge,youth,noFinal,returnPotential});
    }
    const norm=key=>{const vals=rows.map(x=>x[key]),lo=Math.min(...vals),hi=Math.max(...vals);return v=>hi===lo ? .5 : clamp01((v-lo)/(hi-lo));};
    const nTotal=norm('total'),nRecent=norm('recentAvg'),nMom=norm('momentum'),nSf=norm('sfs'),nQf=norm('qfs'),nSfStreak=norm('sfStreak'),nQfStreak=norm('qfStreak');
    rows.forEach(x=>{
      const finalExp=Math.min(1,x.finals/3),consistency=.6*nSf(x.sfs)+.4*nSfStreak(x.sfStreak),current=.6*nRecent(x.recentAvg)+.4*Math.min(1,x.lastYear/5);
      x.safe=100*(.34*nTotal(x.total)+.26*finalExp+.22*consistency+.18*current);
      const fresh=.55*x.noFinal+.25*x.youth+.20*x.returnPotential,momentumPos=.8*nMom(x.momentum)+(x.momentum>0?.2:0),threshold=.55*nQfStreak(x.qfStreak)+.45*nSfStreak(x.sfStreak);
      x.rising=100*(.34*clamp01(momentumPos)+.30*threshold+.22*fresh+.14*nRecent(x.recentAvg));
    });
    return rows;
  }
  function forecastReason(x,starWeight){
    const r=[];if(x.sfStreak>=2)r.push(`${x.sfStreak}年連続SF+`);else if(x.qfStreak>=2)r.push(`${x.qfStreak}年連続QF+`);if(x.momentum>.8)r.push('上昇中');if(x.noFinal)r.push('初決勝候補');else if(x.returnPotential>.4)r.push('再浮上候補');if(x.finals>=2&&starWeight<55)r.push(`決勝${x.finals}回`);if(x.recentAvg>=3)r.push('直近高水準');return r.slice(0,3);
  }
  const forecastPrev={};
  function renderForecast(){
    const slider=document.getElementById('forecastSlider'),star=+slider.value,safe=100-star,style=star<30?'TRACK RECORD':star>70?'RISING STARS':'BALANCED',c=document.getElementById('forecastContest').value;
    const rows=forecastRows().map(x=>({...x,score:(safe*x.safe+star*x.rising)/100})).sort((a,b)=>b.score-a.score||b.rising-a.rising||b.safe-a.safe),top=rows.slice(0,10);
    const currentMap=new Map(rows.map((x,i)=>[x.name,i+1]));
    const prev=forecastPrev[c]||null, prevMap=prev?.rankMap||new Map(), prevTop=prev?.topNames||[];
    const currentTop=top.map(x=>x.name), entered=prev?currentTop.filter(n=>!prevTop.includes(n)):[], exited=prev?prevTop.filter(n=>!currentTop.includes(n)):[];
    const movers=prev?top.map((x,i)=>({name:x.name,now:i+1,prev:prevMap.get(x.name)||null,delta:prevMap.has(x.name)?prevMap.get(x.name)-(i+1):null})).filter(x=>x.delta!==null&&x.delta!==0).sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta)).slice(0,5):[];
    document.getElementById('forecastStyleLabel').textContent=style;document.getElementById('forecastSliderValue').textContent=`実績 ${safe}% / 新星 ${star}%`;
    document.getElementById('forecastWeights').innerHTML=`<div class="forecastweight"><span>TRACK RECORD</span><b>${safe}%</b></div><div class="forecastweight"><span>RISING</span><b>${star}%</b></div><div class="forecastweight"><span>候補母集団</span><b>${rows.length}組</b></div><div class="forecastweight"><span>予測年</span><b>2026</b></div>`;
    const top20=rows.slice(0,20), finalists=top20.slice(0,10), borderline=top20.slice(10,20);
    const cardHtml=(x,i,zone)=>{const rankNo=i+1,rs=forecastReason(x,star),pct=Math.max(4,Math.min(100,x.score)),oldRank=prevMap.get(x.name),delta=oldRank?oldRank-rankNo:null,crossIn=prev&&oldRank>10&&rankNo<=10,crossOut=prev&&oldRank<=10&&rankNo>10,deltaCls=crossIn?'new':delta>0?'up':delta<0?'down':'',deltaText=crossIn?'IN':crossOut?'OUT':delta>0?`↑${delta}`:delta<0?`↓${Math.abs(delta)}`:'—',cardCls=crossIn?'cross-in':crossOut?'cross-out':delta>0?'is-up':delta<0?'is-down':'';return`<div class="forecastpick ${zone==='finalist'?'finalist-zone':'border-zone'} ${cardCls}" data-name="${esc(x.name)}"><div class="rank">${rankNo}</div><div><b>${esc(x.name)}${prev?`<span class="forecastdelta ${deltaCls}">${deltaText}</span>`:''}</b><small>${rs.length?rs.join(' / '):'戦績バランス型'}</small><div class="forecastmeta">${x.noFinal?'<span class="forecasttag new">初決勝候補</span>':''}${x.momentum>.8?'<span class="forecasttag hot">MOMENTUM</span>':''}${x.finals?`<span class="forecasttag">FINAL ${x.finals}</span>`:''}</div><div class="forecastbar"><i style="width:${pct.toFixed(1)}%"></i></div></div><div class="forecastscore"><strong>${x.score.toFixed(1)}</strong><span>INDEX</span></div></div>`};
    const borderGap=finalists.length&&borderline.length?Math.max(0,finalists[finalists.length-1].score-borderline[0].score):0;
    const gapClass=borderGap<0.5?'chaos':borderGap<1.5?'close':borderGap<3?'clearish':'clear';
    const gapLabel=borderGap<0.5?'大混戦':borderGap<1.5?'接戦':borderGap<3?'やや明確':'明確';
    const gapPct=Math.max(4,Math.min(100,borderGap/4*100));
    document.getElementById('forecastLineup').innerHTML=`<div class="forecastzones" style="grid-column:1/-1"><section class="forecastzone finalist"><div class="forecastzonehead"><b>FINALIST ZONE · TOP 10</b><span>現時点の決勝予想圏</span></div><div class="forecastlineup">${finalists.map((x,i)=>cardHtml(x,i,'finalist')).join('')}</div></section><div class="forecastcut"><span>10位 / 11位 BORDER</span><span class="forecastgap ${gapClass}" title="10位と11位のFORECAST INDEX差"><em>BORDER GAP</em><b>${borderGap.toFixed(2)}</b><span>${gapLabel}</span><span class="forecastgapbar"><i style="width:${gapPct.toFixed(0)}%"></i></span></span></div><section class="forecastzone borderline"><div class="forecastzonehead"><b>BORDERLINE · 11–20</b><span>スライダー次第で決勝圏に入る候補</span></div><div class="forecastlineup">${borderline.map((x,j)=>cardHtml(x,j+10,'border')).join('')}</div></section></div>`;wireNames(document.getElementById('forecastLineup'));
    const changes=document.getElementById('forecastChanges'),groups=document.getElementById('forecastChangeGroups');
    if(prev&&(entered.length||exited.length||movers.length)){
      const inHtml=entered.length?`<div class="forecastchangegroup"><span>TOP10 IN</span>${entered.map(n=>`<i class="forecastchangechip in">${esc(n)}</i>`).join('')}</div>`:'';
      const outHtml=exited.length?`<div class="forecastchangegroup"><span>TOP10 OUT</span>${exited.map(n=>`<i class="forecastchangechip out">${esc(n)}</i>`).join('')}</div>`:'';
      const moveHtml=movers.length?`<div class="forecastchangegroup"><span>MOVE</span>${movers.map(m=>`<i class="forecastchangechip ${m.delta>0?'up':'down'}">${esc(m.name)} ${m.delta>0?'↑'+m.delta:'↓'+Math.abs(m.delta)}</i>`).join('')}</div>`:'';
      groups.innerHTML=inHtml+outHtml+moveHtml;changes.hidden=false;
    }else{groups.innerHTML='';changes.hidden=true;}
    document.getElementById('forecastTable').innerHTML=`<table class="discoverlist"><thead><tr><th>#</th><th>ユニット</th><th>FORECAST</th><th>実績</th><th>新星</th><th>累積POWER</th><th>決勝</th><th>SF+</th><th>MOMENTUM</th></tr></thead><tbody>${rows.slice(0,30).map((x,i)=>{const old=prevMap.get(x.name),delta=old?old-(i+1):null;return`<tr class="${i<10?'forecast-row-finalist':i<20?'forecast-row-border':''}" data-name="${esc(x.name)}"><td>${i+1}${prev&&delta?` <span class="forecastdelta ${delta>0?'up':'down'}">${delta>0?'↑'+delta:'↓'+Math.abs(delta)}</span>`:''}</td><td><strong>${esc(x.name)}</strong></td><td><span class="metricpill ${i<10?'hot':''}">${x.score.toFixed(1)}</span></td><td>${x.safe.toFixed(1)}</td><td>${x.rising.toFixed(1)}</td><td>${x.total}</td><td>${x.finals}</td><td>${x.sfs}</td><td>${x.momentum>=0?'+':''}${x.momentum.toFixed(2)}</td></tr>`}).join('')}</tbody></table>`;wireNames(document.getElementById('forecastTable'));
    document.getElementById('forecastNote').innerHTML=`※ ${c==='m1'?'M-1':'KOC'} 2026を、<b>2025年まで</b>のDB戦績だけでシミュレーション。2026年の既知結果は計算から除外しています。<b>${c==='m1'?'M-1':'KOC'}歴代優勝者は候補から除外</b>しています。FORECAST INDEXは確率ではなく比較用の相対指数です。${c==='m1'?'M-1はDB上の結成年が2010年以前の組を候補から除外。':''} スライダー操作時のIN / OUTは、10位↔11位の決勝ボーダーをまたいだ変化を示します。BORDER GAPは10位と11位のFORECAST INDEX差で、0に近いほど予想が割れやすい状態です。`;
    forecastPrev[c]={topNames:currentTop,rankMap:currentMap,star};
    renderBacktest();
  }

  function historicalForecastRows(c,targetYear){
    const cutoff=targetYear-1, years=contestYears(c).filter(y=>y<=cutoff), recent=years.slice(-3), prev=years.slice(-6,-3), rows=[];
    for(const d of DB){
      if(c==='m1' && (+d.formed||0) && +d.formed<targetYear-15)continue;
      const obj=(c==='m1'?d.m1:d.koc)||{}, entries=Object.entries(obj).filter(([y])=>+y<=cutoff);
      if(!entries.length)continue;
      const total=entries.reduce((sum,[,v])=>sum+pt(v),0), finals=entries.filter(([,v])=>rv(v)>=4).length, sfs=entries.filter(([,v])=>rv(v)>=3).length, qfs=entries.filter(([,v])=>rv(v)>=2).length;
      const avg=ys=>ys.length?ys.reduce((sum,y)=>sum+fStageValue(obj[String(y)]),0)/ys.length:0;
      const recentAvg=avg(recent),prevAvg=avg(prev),momentum=recentAvg-prevAvg,lastYear=years.length?fStageValue(obj[String(years.at(-1))]):0;
      const streak=level=>{let n=0;for(let i=years.length-1;i>=0;i--){const v=obj[String(years[i])];if(v&&rv(v)>=level)n++;else break;}return n};
      const sfStreak=streak(3),qfStreak=streak(2),formed=+d.formed||null,careerAge=formed?targetYear-formed:null,youth=careerAge==null?.45:clamp01((15-careerAge)/12),noFinal=finals===0?1:0;
      const finalYears=entries.filter(([,v])=>rv(v)>=4).map(([y])=>+y),finalGap=finalYears.length?cutoff-Math.max(...finalYears):999,returnPotential=finals>0&&finalGap>=2?Math.min(1,finalGap/5):0;
      rows.push({name:d.name,total,finals,sfs,qfs,recentAvg,prevAvg,momentum,lastYear,sfStreak,qfStreak,formed,careerAge,youth,noFinal,returnPotential});
    }
    if(!rows.length)return rows;
    const norm=key=>{const vals=rows.map(x=>x[key]),lo=Math.min(...vals),hi=Math.max(...vals);return v=>hi===lo?.5:clamp01((v-lo)/(hi-lo))};
    const nTotal=norm('total'),nRecent=norm('recentAvg'),nMom=norm('momentum'),nSf=norm('sfs'),nQf=norm('qfs'),nSfStreak=norm('sfStreak'),nQfStreak=norm('qfStreak');
    rows.forEach(x=>{
      const finalExp=Math.min(1,x.finals/3),consistency=.6*nSf(x.sfs)+.4*nSfStreak(x.sfStreak),current=.6*nRecent(x.recentAvg)+.4*Math.min(1,x.lastYear/5);
      x.safe=100*(.34*nTotal(x.total)+.26*finalExp+.22*consistency+.18*current);
      const fresh=.55*x.noFinal+.25*x.youth+.20*x.returnPotential,momentumPos=.8*nMom(x.momentum)+(x.momentum>0?.2:0),threshold=.55*nQfStreak(x.qfStreak)+.45*nSfStreak(x.sfStreak);
      x.rising=100*(.34*clamp01(momentumPos)+.30*threshold+.22*fresh+.14*nRecent(x.recentAvg));
    });
    return rows;
  }
  function renderBacktest(){
    const c=document.getElementById('forecastContest').value,star=+document.getElementById('forecastSlider').value,safe=100-star,style=star<30?'TRACK RECORD':star>70?'RISING STARS':'BALANCED';
    const available=contestYears(c).filter(y=>y<=2025).sort((a,b)=>b-a),targets=available.slice(0,3).sort((a,b)=>a-b),results=[];
    for(const year of targets){
      const ranked=historicalForecastRows(c,year).map(x=>({...x,score:(safe*x.safe+star*x.rising)/100})).sort((a,b)=>b.score-a.score||b.rising-a.rising||b.safe-a.safe);
      const actual=DB.filter(d=>rv(((c==='m1'?d.m1:d.koc)||{})[String(year)])>=4).map(d=>d.name),actualSet=new Set(actual);
      const top10=ranked.slice(0,10).map(x=>x.name),top20=ranked.slice(0,20).map(x=>x.name),hit10=top10.filter(n=>actualSet.has(n)),hit20=top20.filter(n=>actualSet.has(n));
      const predictable=actual.filter(n=>ranked.some(x=>x.name===n)),missed=actual.filter(n=>!top20.includes(n));
      results.push({year,actual,top10,top20,hit10,hit20,predictable,missed});
    }
    const actualN=results.reduce((s,x)=>s+x.actual.length,0),hit10N=results.reduce((s,x)=>s+x.hit10.length,0),hit20N=results.reduce((s,x)=>s+x.hit20.length,0),predictableN=results.reduce((s,x)=>s+x.predictable.length,0);
    const pct=(n,d)=>d?(n/d*100).toFixed(1):'0.0';
    document.getElementById('backtestStyle').textContent=style+` · 実績${safe}% / 新星${star}%`;
    document.getElementById('backtestSummary').innerHTML=`<div class="backtestcard"><span>TOP10 HIT RATE</span><b>${pct(hit10N,actualN)}%</b><small>${hit10N} / ${actualN} finalists</small></div><div class="backtestcard"><span>TOP20 COVERAGE</span><b>${pct(hit20N,actualN)}%</b><small>${hit20N} / ${actualN}</small></div><div class="backtestcard"><span>PREDICTABLE POOL</span><b>${pct(predictableN,actualN)}%</b><small>前年までに戦績あり ${predictableN}組</small></div><div class="backtestcard"><span>TEST YEARS</span><b>${results.length}</b><small>${results.map(x=>x.year).join(' / ')}</small></div>`;
    document.getElementById('backtestYears').innerHTML=results.map(x=>{
      const h10=pct(x.hit10.length,x.actual.length),h20=pct(x.hit20.length,x.actual.length),hitNames=x.hit10.length?x.hit10.join(' / '):'—',miss=x.missed.length?x.missed.join(' / '):'なし';
      return `<article class="backtestyear ${x.hit10.length===x.actual.length&&x.actual.length?'backtestperfect':''}"><div class="backtestyearhead"><b>${c==='m1'?'M-1':'KOC'} ${x.year}</b><span class="backtestscore">${x.hit10.length} / ${x.actual.length} HIT</span></div><div class="backtestmini"><div><span>TOP10 的中率</span><b>${h10}%</b></div><div><span>TOP20 捕捉率</span><b>${h20}%</b></div></div><div class="backtesthits"><strong>TOP10 HIT</strong><br>${esc(hitNames)}</div><div class="backtesthits backtestmiss"><strong>TOP20外</strong><br>${esc(miss)}</div></article>`;
    }).join('');
  }
  function renderCurrent(){ if(current==='generation')renderGeneration(); else if(current==='momentum')renderMomentum(); else if(current==='path')renderPath(); else if(current==='crossover')renderCrossover(); else renderForecast(); }
  ['genContest','momentumContest','pathContest','crossMin','forecastContest'].forEach(id=>document.getElementById(id)?.addEventListener('change',renderCurrent)); document.getElementById('forecastSlider')?.addEventListener('input',renderForecast); let rt;addEventListener('resize',()=>{if(root.classList.contains('primary-view-hidden'))return;clearTimeout(rt);rt=setTimeout(renderCurrent,120)});
  let initial='generation';try{const s=sessionStorage.getItem('m1kocDiscoveryTab');if(info[s])initial=s}catch(e){}setTab(initial);
  window.M1KOC_DISCOVERY={version:'v248',tabs:Object.keys(info),forecast:{target_year:2026,cutoff_year:2025,slider:true}};window.M1KOC_CHECKPOINT={...(window.M1KOC_CHECKPOINT||{}),version:'v229',focus:'forecast historical backtest / hit rate / top20 coverage',checked_at:'2026-09-14'};
})();


/* v230 editorial home digest */
(()=>{
  const totalEl=document.getElementById('edTotal');
  if(!totalEl||typeof DB==='undefined')return;
  const score=v=>/優勝/.test(v)?15:/^決勝/.test(v)?5:/準決勝/.test(v)?3:/準々決勝/.test(v)?2:/3回戦|３回戦/.test(v)?1:0;
  const esc=s=>String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  const hasAny=o=>o&&Object.keys(o).length>0;
  const agencyName=d=>{const a=d.agency_key||d.agency||'';if(a==='mixed')return '複数所属';if(a==='サンミュージック')return 'サンミュージックプロダクション';if(a==='SMA NEET PROJECT')return 'SMA';return a};
  const inHomePeriod=o=>Object.keys(o||{}).some(y=>+y>=2015&&+y<=2025);
  const championCount=()=>{const set=new Set();for(const d of DB){for(const [y,v] of Object.entries(d.m1||{}))if(+y>=2015&&+y<=2025&&/優勝/.test(v))set.add(d.name);for(const [y,v] of Object.entries(d.koc||{}))if(+y>=2015&&+y<=2025&&/優勝/.test(v))set.add(d.name)}return set.size};
  function setStats(){
    document.getElementById('edTotal').textContent=DB.filter(d=>inHomePeriod(d.m1)||inHomePeriod(d.koc)).length.toLocaleString('ja-JP');
    document.getElementById('edM1').textContent=DB.filter(d=>inHomePeriod(d.m1)).length.toLocaleString('ja-JP');
    document.getElementById('edKoc').textContent=DB.filter(d=>inHomePeriod(d.koc)).length.toLocaleString('ja-JP');
    document.getElementById('edChamp').textContent=championCount().toLocaleString('ja-JP');
  }
  function agencyRows(){
    const by=new Map();
    for(const d of DB){
      if(!d.agency_verified||!d.agency)continue;
      let m1=0,koc=0,finalists=0;
      for(const [y,v] of Object.entries(d.m1||{})){ if(+y>=2015&&+y<=2025){m1+=score(v); if(/^決勝|優勝/.test(v)) finalists++;} }
      for(const [y,v] of Object.entries(d.koc||{})){ if(+y>=2015&&+y<=2025){koc+=score(v); if(/^決勝|優勝/.test(v)) finalists++;} }
      const total=m1+koc; if(!total)continue;
      const a=agencyName(d);
      if(!by.has(a))by.set(a,{agency:a,n:0,total:0,m1:0,koc:0,finalists:0});
      const row=by.get(a); row.n++; row.total+=total; row.m1+=m1; row.koc+=koc; row.finalists+= finalists?1:0;
    }
    return [...by.values()].map(r=>({...r,avg:r.n?r.total/r.n:0,finalRate:r.n?r.finalists/r.n*100:0,dna:(r.m1+r.koc)?(r.m1/(r.m1+r.koc)>=.65?'m1':r.m1/(r.m1+r.koc)<=.35?'koc':'dual'):'dual'})).sort((a,b)=>b.total-a.total||b.avg-a.avg||b.n-a.n||a.agency.localeCompare(b.agency,'ja'));
  }
  function renderAgencyRank(rows){
    const ol=document.getElementById('homeAgencyRank'); if(!ol)return;
    const top=rows.slice(0,8), max=Math.max(1,...top.map(r=>r.total));
    ol.innerHTML=top.map((r,i)=>`<li><span class="no">${String(i+1).padStart(2,'0')}</span><span class="name">${esc(r.agency)}</span><span class="bar"><i style="width:${(r.total/max*100).toFixed(1)}%"></i></span><span class="pt">${r.total}</span></li>`).join('');
  }
  let homeHits=[];
  function drawAgencyPreview(rows){
    const canvas=document.getElementById('homeAgencyCanvas'); if(!canvas)return;
    const rect=canvas.getBoundingClientRect(), dpr=Math.min(2,window.devicePixelRatio||1), w=Math.max(320,rect.width||320), h=Math.max(260,rect.height||360);
    canvas.width=w*dpr; canvas.height=h*dpr; const ctx=canvas.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
    const shown=rows.slice(0,18), pad={l:34,r:12,t:16,b:28}, pw=w-pad.l-pad.r, ph=h-pad.t-pad.b, maxN=Math.max(1,...shown.map(r=>r.n)), maxY=Math.max(1,...shown.map(r=>r.avg)), maxT=Math.max(1,...shown.map(r=>r.total));
    homeHits=[]; ctx.font='8px Arial'; ctx.textBaseline='middle';
    for(let i=0;i<=4;i++){ const yy=pad.t+ph-ph*i/4; ctx.strokeStyle='rgba(70,65,55,.12)'; ctx.beginPath(); ctx.moveTo(pad.l,yy); ctx.lineTo(w-pad.r,yy); ctx.stroke(); if(i<4){ctx.fillStyle='#646971'; ctx.textAlign='right'; ctx.fillText((maxY*i/4).toFixed(1),pad.l-6,yy);} }
    for(let i=0;i<=4;i++){ const xx=pad.l+pw*i/4; ctx.strokeStyle='rgba(70,65,55,.08)'; ctx.beginPath(); ctx.moveTo(xx,pad.t); ctx.lineTo(xx,pad.t+ph); ctx.stroke(); ctx.fillStyle='#646971'; ctx.textAlign='center'; ctx.fillText(String(Math.round(maxN*i/4)),xx,h-pad.b+12); }
    ctx.fillStyle='#767b83'; ctx.textAlign='left'; ctx.fillText('AVG POWER',4,10); ctx.textAlign='right'; ctx.fillText('TEAMS',w-2,h-10);
    const labelSet=new Set(shown.slice(0,7).map(r=>r.agency));
    shown.forEach(r=>{ const x=pad.l+pw*(r.n/maxN), y=pad.t+ph-ph*(r.avg/maxY), rr=4+Math.sqrt(r.total/maxT)*13; const color=r.dna==='m1'?'rgba(239,90,84,.58)':r.dna==='koc'?'rgba(107,165,223,.58)':'rgba(223,188,104,.62)'; ctx.fillStyle=color; ctx.strokeStyle='rgba(245,245,245,.62)'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(x,y,rr,0,Math.PI*2); ctx.fill(); ctx.stroke(); homeHits.push({x,y,r:rr+6,row:r}); if(labelSet.has(r.agency)){ ctx.fillStyle='#b9bcc2'; ctx.textAlign='left'; ctx.fillText(r.agency,x+rr+4,y);} });
  }
  function hitHome(e){ const canvas=document.getElementById('homeAgencyCanvas'); if(!canvas)return null; const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top; return homeHits.find(p=>Math.hypot(x-p.x,y-p.y)<=p.r); }
  function bindAgencyPreviewTip(){
    const canvas=document.getElementById('homeAgencyCanvas'), tip=document.getElementById('homeAgencyTip'); if(!canvas||!tip)return;
    canvas.onpointermove=e=>{ const p=hitHome(e); if(!p){tip.classList.remove('show'); return;} const r=canvas.parentElement.getBoundingClientRect(); tip.innerHTML=`<b>${esc(p.row.agency)}</b><br>POWER ${p.row.total}pt / AVG ${p.row.avg.toFixed(2)}<br>TEAMS ${p.row.n} / FINALISTS ${p.row.finalists}<br><span style="color:#8a8e95">クリックでAGENCYへ</span>`; tip.style.left=Math.min(e.clientX-r.left+12, r.width-190)+'px'; tip.style.top=(e.clientY-r.top+8)+'px'; tip.classList.add('show'); };
    canvas.onpointerleave=()=>tip.classList.remove('show');
    canvas.onclick=e=>{ if(!hitHome(e))return; if(window.M1KOC_PRIMARY_VIEW?.set) window.M1KOC_PRIMARY_VIEW.set('agency',true); };
  }
  function formedYear(d){ const y=parseInt(String(d.formed||'').slice(0,4),10); return Number.isFinite(y)?y:null; }
  function eligible(d,contest,targetYear){ if(contest!=='m1') return true; const y=formedYear(d); return y? y>=targetYear-15 : true; }
  function forecastPool(contest,targetYear,bias){
    const list=[];
    for(const d of DB){
      if(!eligible(d,contest,targetYear)) continue;
      const rec=d[contest]||{}; const years=Object.keys(rec).map(Number).filter(y=>y<targetYear); if(!years.length) continue;
      // Exclude only champions already crowned before the prediction target year.
      // This keeps historical backtests honest: the eventual winner of that target
      // year remains eligible if they had not won the contest before then.
      if(years.some(y=>/優勝/.test(String(rec[String(y)]||'')))) continue;
      let total=0, recency=0, recent3=0, prev3=0, sf=0, finals=0, qf=0, best=0, recentSfStreak=0;
      for(const y of years){ const v=rec[String(y)], pt=score(v), age=targetYear-y; total+=pt; if(age===1)recency+=pt*4; else if(age===2)recency+=pt*3; else if(age===3)recency+=pt*2; else if(age<=6)recency+=pt*1.1; else recency+=pt*.55; if(age>=1&&age<=3)recent3+=pt; if(age>=4&&age<=6)prev3+=pt; if(/準決勝|決勝|優勝/.test(v)) sf++; if(/^決勝|優勝/.test(v)) finals++; if(/準々決勝|準決勝|決勝|優勝/.test(v)) qf++; best=Math.max(best,pt); }
      for(let y=targetYear-1;y>=Math.max(targetYear-3,2000);y--){ const v=rec[String(y)]||''; if(/準決勝|決勝|優勝/.test(v)) recentSfStreak++; else break; }
      const momentum=recent3-prev3; const youth=(()=>{const y=formedYear(d); if(!y) return .4; const age=targetYear-y; return age<=5?1:age<=8?.75:age<=12?.35:0})();
      const track=total + finals*7 + sf*2.1 + best*1.6 + qf*.6;
      const rising=recency*1.05 + Math.max(0,momentum)*1.55 + (finals===0?8:0) + youth*5 + recentSfStreak*3.3;
      const mixed=track*(1-bias)+rising*bias;
      list.push({name:d.name,score:mixed,track,rising,total,finals,sf,qf,momentum,streak:recentSfStreak,formed:formedYear(d),contest,rec});
    }
    return list.sort((a,b)=>b.score-a.score||b.rising-a.rising||a.name.localeCompare(b.name,'ja'));
  }
  function actualFinalists(contest,year){
    const set=new Set(); for(const d of DB){ const v=(d[contest]||{})[String(year)]||''; if(/^決勝|優勝/.test(v)) set.add(d.name); } return set;
  }
  let homeForecastContest='m1',homeBacktestContest='m1';
  function reasonText(x){ const parts=[]; if(x.streak>=3) parts.push(`${x.streak}年連続SF級`); else if(x.sf>=3) parts.push(`SF級 ${x.sf}回`); if(x.finals===0) parts.push('初決勝候補'); else if(x.finals>=1) parts.push('決勝経験'); if(x.momentum>5) parts.push('上昇中'); return parts.slice(0,2).join(' / ')||'有力候補'; }
  function renderForecastPreview(){
    const list=document.getElementById('homeForecastList'); if(!list) return;
    const top=forecastPool(homeForecastContest,2026,.5).slice(0,5),label=homeForecastContest==='m1'?'M-1':'KOC';
    const mode=document.getElementById('homeForecastModeLabel');if(mode)mode.textContent=`${label} / BALANCED`;
    document.querySelectorAll('[data-home-forecast-contest]').forEach(b=>b.classList.toggle('on',b.dataset.homeForecastContest===homeForecastContest));
    list.innerHTML=top.map((x,i)=>`<li><span class="rank">${String(i+1).padStart(2,'0')}</span><div><div class="name">${esc(x.name)}</div><div class="meta">${esc(reasonText(x))}</div></div><span class="score">${x.score.toFixed(1)}</span></li>`).join('');
  }
  function renderBacktestPreview(){
    const sum=document.getElementById('homeBacktestSummary'), tableWrap=document.getElementById('homeBacktestTable'); if(!sum||!tableWrap) return;
    const contest=homeBacktestContest,label=contest==='m1'?'M-1':'KOC',years=[2023,2024,2025],rows=[];
    let hit10N=0,cover20N=0,actualN=0;
    for(const y of years){
      const actual=[...actualFinalists(contest,y)]; if(!actual.length)continue;
      const pred=forecastPool(contest,y,.5),top10=new Set(pred.slice(0,10).map(x=>x.name)),top20=new Set(pred.slice(0,20).map(x=>x.name));
      const hit=actual.filter(n=>top10.has(n)).length,cover=actual.filter(n=>top20.has(n)).length;
      hit10N+=hit;cover20N+=cover;actualN+=actual.length;rows.push({year:y,hit,cover,actual:actual.length});
    }
    document.querySelectorAll('[data-home-backtest-contest]').forEach(b=>b.classList.toggle('on',b.dataset.homeBacktestContest===contest));
    sum.innerHTML=`<div><span>${label} TOP10 HIT</span><b class="big">${actualN?(hit10N/actualN*100).toFixed(0):0}%</b><b>${hit10N} / ${actualN}</b></div><div><span>TOP20 COVER</span><b>${actualN?(cover20N/actualN*100).toFixed(0):0}%</b></div>`;
    tableWrap.innerHTML=`<table class="edbacktesttable"><thead><tr><th>大会年</th><th>TOP10的中</th><th>TOP20カバー</th><th>決勝組</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.year}</td><td>${r.hit} / ${r.actual}</td><td>${r.cover} / ${r.actual}</td><td>${r.actual}</td></tr>`).join('')}</tbody></table>`;
  }
  function renderPickups(){
    const wrap=document.getElementById('homePickups'); if(!wrap) return;
    const list=forecastPool('m1',2026,.76).filter(x=>x.finals===0).slice(0,3);
    wrap.innerHTML=list.map(x=>`<div class="edpickupitem"><b>${esc(x.name)}</b><span>${esc(reasonText(x))}</span><p>直近の伸びと準決勝級の継続を高めに評価。スライダーを新星側へ寄せるほど浮上しやすい候補です。</p></div>`).join('');
  }
  function bindLinks(){ document.querySelectorAll('.edlink[data-go="agency"]').forEach(a=>a.onclick=e=>{e.preventDefault(); window.M1KOC_PRIMARY_VIEW?.set&&window.M1KOC_PRIMARY_VIEW.set('agency',true);}); document.querySelectorAll('.edlink[data-go="discovery"]').forEach(a=>a.onclick=e=>{e.preventDefault(); window.M1KOC_PRIMARY_VIEW?.set&&window.M1KOC_PRIMARY_VIEW.set('discovery',true);}); document.querySelectorAll('[data-home-forecast-contest]').forEach(b=>b.onclick=()=>{homeForecastContest=b.dataset.homeForecastContest;renderForecastPreview();}); document.querySelectorAll('[data-home-backtest-contest]').forEach(b=>b.onclick=()=>{homeBacktestContest=b.dataset.homeBacktestContest;renderBacktestPreview();}); }
  function render(){ const rows=agencyRows(); setStats(); renderAgencyRank(rows); drawAgencyPreview(rows); renderForecastPreview(); renderBacktestPreview(); renderPickups(); }
  render(); bindAgencyPreviewTip(); bindLinks();
  let rt; addEventListener('resize',()=>{ clearTimeout(rt); rt=setTimeout(()=>drawAgencyPreview(agencyRows()),120); });
  window.M1KOC_HOME_EDITORIAL={version:'v233',sections:['stats','agency_feature','forecast_preview','backtest_preview','pickups'],render,redraw:()=>drawAgencyPreview(agencyRows())};
})();

/* v232 reference navigation / home shell */
(()=>{
  const body=document.body;
  const menu=document.getElementById('refMobileMenu');
  const menuBtn=document.getElementById('refMenuButton');
  const navLinks=[...document.querySelectorAll('[data-ref-nav]')];
  const sideLinks=[...document.querySelectorAll('.ref-nav [data-ref-nav]')];
  const closeMenu=()=>{if(!menu||!menuBtn)return;menu.hidden=true;menuBtn.setAttribute('aria-expanded','false')};
  if(menuBtn&&menu){menuBtn.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;menuBtn.setAttribute('aria-expanded',open?'true':'false')})}
  const setActive=name=>sideLinks.forEach(a=>a.classList.toggle('active',a.dataset.refNav===name));
  const scrollTo=id=>requestAnimationFrame(()=>document.querySelector(id)?.scrollIntoView({behavior:'smooth',block:'start'}));
  const openHome=()=>{
    body.classList.add('home-index');
    window.M1KOC_PRIMARY_VIEW?.set?.('database',false);
    setActive('home');
    window.scrollTo({top:0,behavior:'smooth'});
  };
  const openDatabase=(target='teams')=>{
    body.classList.remove('home-index');
    window.M1KOC_PRIMARY_VIEW?.set?.('database',false);
    setActive(target);
    scrollTo(target==='about'?'#about':'#search');
  };
  const openDiscovery=(forecast=false)=>{
    body.classList.remove('home-index');
    window.M1KOC_PRIMARY_VIEW?.set?.('discovery',false);
    setActive(forecast?'forecast':'discovery');
    requestAnimationFrame(()=>{
      if(forecast){
        const b=document.querySelector('[data-discovery-tab="forecast"]');
        if(b)b.click();
      }
      document.getElementById('discoveryRoot')?.scrollIntoView({behavior:'smooth',block:'start'});
    });
  };
  const openVisuals=()=>{
    body.classList.remove('home-index');
    window.M1KOC_PRIMARY_VIEW?.set?.('agency',false);
    setActive('visuals');
    requestAnimationFrame(()=>{
      const b=document.getElementById('agencyTabVisuals');
      if(b)b.click();
      document.getElementById('agencyVisuals')?.scrollIntoView({behavior:'smooth',block:'start'});
    });
  };
  navLinks.forEach(a=>a.addEventListener('click',e=>{
    e.preventDefault(); closeMenu();
    const name=a.dataset.refNav;
    if(name==='home')openHome();
    else if(name==='teams')openDatabase('teams');
    else if(name==='about')openDatabase('about');
    else if(name==='forecast')openDiscovery(true);
    else if(name==='discovery')openDiscovery(false);
    else if(name==='visuals')openVisuals();
  }));
  // Home feature links should use the same shell navigation.
  document.querySelectorAll('.edlink[data-go="agency"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();openVisuals()}));
  document.querySelectorAll('.edlink[data-go="discovery"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();openDiscovery(true)}));
  // Reference screenshot represents the default landing page.
  if(!['#agency','#discovery'].includes(location.hash)){
    body.classList.add('home-index');
    setActive('home');
  }else{
    body.classList.remove('home-index');
    setActive(location.hash==='#agency'?'visuals':'discovery');
  }
  window.M1KOC_REFERENCE_SHELL={version:'v232',home:openHome,teams:()=>openDatabase('teams'),visuals:openVisuals,discovery:()=>openDiscovery(false),forecast:()=>openDiscovery(true)};
})();


/* v233 content restoration + robust navigation */
(()=>{
  if(typeof DB==='undefined') return;
  const body=document.body;
  const menu=document.getElementById('refMobileMenu');
  const menuBtn=document.getElementById('refMenuButton');
  const sideLinks=[...document.querySelectorAll('.ref-nav [data-ref-nav]')];
  const setActive=name=>sideLinks.forEach(a=>a.classList.toggle('active',a.dataset.refNav===name));
  const closeMenu=()=>{if(menu)menu.hidden=true;if(menuBtn)menuBtn.setAttribute('aria-expanded','false')};
  const afterLayout=fn=>requestAnimationFrame(()=>requestAnimationFrame(fn));
  const refresh=()=>afterLayout(()=>{
    try{window.dispatchEvent(new Event('resize'))}catch(_e){}
    try{window.M1KOC_HOME_EDITORIAL?.redraw?.()}catch(_e){}
  });
  const setPrimary=name=>{
    if(window.M1KOC_PRIMARY_VIEW?.set){window.M1KOC_PRIMARY_VIEW.set(name,false);return true}
    const groups={
      database:['.nextstar.nextstar-v2','.featurebar','#search','.sectionlabel','.stats','#grid','#comparebar','#about','#analytics'],
      agency:['#agencyTabs','#agencyDashboard','#agencyEvolution','#agencyTournament','#agencyInsights','#agencyVisuals'],
      discovery:['#discoveryRoot']
    };
    for(const [key,sels] of Object.entries(groups))for(const sel of sels)document.querySelectorAll(sel).forEach(el=>el.classList.toggle('primary-view-hidden',key!==name));
    document.body.classList.toggle('primary-database',name==='database');
    document.body.classList.toggle('primary-agency',name==='agency');
    document.body.classList.toggle('primary-discovery',name==='discovery');
    document.querySelectorAll('#primaryTabs [data-primary-target]').forEach(b=>{const on=b.dataset.primaryTarget===name;b.classList.toggle('on',on);b.setAttribute('aria-selected',on?'true':'false')});
    return true;
  };
  function showHome(){
    body.classList.add('home-index');
    setPrimary('database');
    setActive('home');
    closeMenu();
    afterLayout(()=>{window.M1KOC_HOME_EDITORIAL?.render?.();window.scrollTo({top:0,behavior:'smooth'})});
  }
  function showDatabase(anchor='teams'){
    body.classList.remove('home-index');setPrimary('database');setActive(anchor);closeMenu();refresh();
    afterLayout(()=>document.querySelector(anchor==='about'?'#about':'#search')?.scrollIntoView({behavior:'smooth',block:'start'}));
  }
  function showDiscovery(tab='generation'){
    body.classList.remove('home-index');setPrimary('discovery');setActive(tab==='forecast'?'forecast':'discovery');closeMenu();
    afterLayout(()=>{
      const b=document.querySelector(`[data-discovery-tab="${tab}"]`); if(b)b.click();
      document.getElementById('discoveryRoot')?.scrollIntoView({behavior:'smooth',block:'start'});
      refresh();
    });
  }
  function showVisuals(){
    body.classList.remove('home-index');setPrimary('agency');setActive('visuals');closeMenu();
    afterLayout(()=>{
      const b=document.getElementById('agencyTabVisuals');if(b)b.click();
      if(typeof window.M1KOC_RENDER_AGENCY_VISUALS==='function')window.M1KOC_RENDER_AGENCY_VISUALS();
      document.getElementById('agencyVisuals')?.scrollIntoView({behavior:'smooth',block:'start'});
      refresh();
    });
  }
  const route=name=>{
    if(name==='home')showHome();
    else if(name==='teams')showDatabase('teams');
    else if(name==='about')showDatabase('about');
    else if(name==='forecast')showDiscovery('forecast');
    else if(name==='discovery')showDiscovery('generation');
    else if(name==='visuals')showVisuals();
  };
  // Capture navigation before older handlers so the reference shell always works.
  document.addEventListener('click',e=>{
    const mb=e.target.closest('#refMenuButton');
    if(mb&&menu){e.preventDefault();e.stopImmediatePropagation();const willOpen=menu.hidden;menu.hidden=!willOpen;menuBtn?.setAttribute('aria-expanded',willOpen?'true':'false');return}
    const nav=e.target.closest('[data-ref-nav]');
    if(nav){e.preventDefault();e.stopImmediatePropagation();route(nav.dataset.refNav);return}
    const go=e.target.closest('.edlink[data-go]');
    if(go){e.preventDefault();e.stopImmediatePropagation();route(go.dataset.go==='agency'?'visuals':'forecast')}
  },true);
  // Re-render the home digest after the v232 shell class has settled.
  afterLayout(()=>{window.M1KOC_HOME_EDITORIAL?.render?.();refresh()});
  window.M1KOC_REFERENCE_SHELL={version:'v233',home:showHome,teams:()=>showDatabase('teams'),visuals:showVisuals,discovery:()=>showDiscovery('generation'),forecast:()=>showDiscovery('forecast'),about:()=>showDatabase('about')};
  window.M1KOC_CHECKPOINT={...(window.M1KOC_CHECKPOINT||{}),version:'v233',focus:'restore home data, charts and navigation on reference-match design',checked_at:'2026-09-15'};
})();


/* v234 prioritized main views: TOTAL POWER / NEXT STAR / AGENCY / FORECAST */
(()=>{
  const body=document.body;
  const tabs=document.getElementById('primaryTabs');
  if(!body||!tabs) return;
  const tabButtons=[...tabs.querySelectorAll('[data-priority-target]')];
  const navLinks=[...document.querySelectorAll('[data-priority-nav]')];
  const menu=document.getElementById('refMobileMenu');
  const menuBtn=document.getElementById('refMenuButton');
  const introKicker=document.getElementById('priorityKicker');
  const introTitle=document.getElementById('priorityTitle');
  const introDescription=document.getElementById('priorityDescription');
  const copy={
    total:{kicker:'RANKING / ALL RECORDS',title:'総合ポイント',description:'M-1・KOC本体点と収録済み外部賞レース加点を合算した、全ユニットの総合ランキング。'},
    nextstar:{kicker:'NEXT STAR FINDER',title:'次に来るコンビ',description:'決勝・準決勝などの未経験ラインを選び、まだ上まで到達していない有力ユニットを抽出。'},
    agency:{kicker:'AGENCY ANALYSIS',title:'事務所で見る',description:'事務所ごとのPOWER、平均値、M-1/KOCの得意領域、年度変化を比較。'},
    forecast:{kicker:'FINALIST FORECAST',title:'2026 決勝予測',description:'実績重視から新星重視まで、スライダーで重みを変えながら決勝候補をシミュレーション。'},
    about:{kicker:'ABOUT / DATA NOTES',title:'このサイトについて',description:'収録範囲、配点、外部賞レース加点、監査状況などのデータノート。'}
  };
  const closeMenu=()=>{if(menu)menu.hidden=true;if(menuBtn)menuBtn.setAttribute('aria-expanded','false')};
  const afterLayout=fn=>requestAnimationFrame(()=>requestAnimationFrame(fn));
  const setPrimary=name=>window.M1KOC_PRIMARY_VIEW?.set?.(name,false);
  const setSelect=(id,value,fire=true)=>{const el=document.getElementById(id);if(!el||![...el.options].some(o=>o.value===value))return;el.value=value;if(fire&&typeof el.onchange==='function')el.onchange()};
  const setAllFilter=()=>{const b=document.querySelector('.pill[data-f="all"]');if(b&&!b.classList.contains('on'))b.click()};
  const setIntro=name=>{const c=copy[name]||copy.total;if(introKicker)introKicker.textContent=c.kicker;if(introTitle)introTitle.textContent=c.title;if(introDescription)introDescription.textContent=c.description};
  const setClasses=name=>{
    ['total','nextstar','agency','forecast','about'].forEach(k=>body.classList.toggle(`priority-${k}`,k===name));
    body.classList.add('home-index');
    tabButtons.forEach(b=>{const on=b.dataset.priorityTarget===name;b.classList.toggle('on',on);b.setAttribute('aria-selected',on?'true':'false')});
    navLinks.forEach(a=>a.classList.toggle('active',a.dataset.priorityNav===name));
  };
  const redraw=()=>afterLayout(()=>{try{window.dispatchEvent(new Event('resize'))}catch(_e){};try{window.M1KOC_HOME_EDITORIAL?.redraw?.()}catch(_e){}});
  function setPriority(name,{scroll=true}={}){
    if(!copy[name])name='total';
    setClasses(name);setIntro(name);closeMenu();
    if(name==='total'){
      setPrimary('database');
      setSelect('pool','all');setSelect('scoreMode','all');setSelect('period','all');setAllFilter();setSelect('sort','extended');
    }else if(name==='nextstar'){
      setPrimary('database');
      setSelect('scoreMode','all');setSelect('period','all');setAllFilter();setSelect('pool','nofinal');setSelect('sort','score');
    }else if(name==='agency'){
      setPrimary('agency');
      afterLayout(()=>{const power=document.getElementById('agencyTabPower');if(power)power.click();});
    }else if(name==='forecast'){
      setPrimary('discovery');
      afterLayout(()=>{const b=document.querySelector('[data-discovery-tab="forecast"]');if(b)b.click();});
    }else if(name==='about'){
      setPrimary('database');
    }
    try{history.replaceState(null,'',`#${name}`)}catch(_e){}
    redraw();
    if(scroll)afterLayout(()=>document.getElementById('primaryTabs')?.scrollIntoView({behavior:'smooth',block:'start'}));
  }
  document.addEventListener('click',e=>{
    const home=e.target.closest('[data-priority-home]');
    if(home){
      e.preventDefault();
      if(window.M1KOC_GATE?.open)window.M1KOC_GATE.open(); else if(window.M1KOC_COVER?.open)window.M1KOC_COVER.open();
      else window.scrollTo({top:0,behavior:'auto'});
      return
    }
    const t=e.target.closest('[data-priority-target]');
    if(t){e.preventDefault();setPriority(t.dataset.priorityTarget);return}
    const n=e.target.closest('[data-priority-nav]');
    if(n){e.preventDefault();setPriority(n.dataset.priorityNav);return}
  },true);
  const hash=(location.hash||'').replace('#','');
  const initial=['total','nextstar','agency','forecast'].includes(hash)?hash:'total';
  afterLayout(()=>setPriority(initial,{scroll:false}));
  window.M1KOC_PRIORITY_VIEW={set:setPriority,get:()=>['total','nextstar','agency','forecast','about'].find(k=>body.classList.contains(`priority-${k}`))||'total',order:['total','nextstar','agency','forecast'],version:'v234'};
  window.M1KOC_CHECKPOINT={...(window.M1KOC_CHECKPOINT||{}),version:'v234',focus:'priority navigation + mobile parity',checked_at:'2026-09-15'};
})();

/* v235 TOTAL POWER editorial visualization */
(()=>{
  const root=document.getElementById('totalPowerPage');
  if(!root||typeof DB==='undefined')return;
  const state={period:'all',scope:'total',limit:40,query:''};
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  const inPeriod=y=>{
    y=+y;
    if(state.period==='recent3')return y>=2023&&y<=2025;
    if(state.period==='2025')return y===2025;
    return y<=2025;
  };
  const resultScore=v=>/優勝/.test(v)?15:/^決勝/.test(v)?5:/準決勝/.test(v)?3:/準々決勝/.test(v)?2:/3回戦|３回戦/.test(v)?1:0;
  const resultRank=v=>/優勝/.test(v)?5:/^決勝/.test(v)?4:/準決勝/.test(v)?3:/準々決勝/.test(v)?2:/3回戦|３回戦/.test(v)?1:0;
  const stageLabel=v=>/優勝/.test(v)?'優勝':/^決勝/.test(v)?'決勝':/準決勝/.test(v)?'準決勝':/準々決勝/.test(v)?'準々決勝':/3回戦|３回戦/.test(v)?'3回戦':'—';
  const bonusRows=d=>{try{return typeof bonusEntries==='function'?bonusEntries(d):[]}catch(_e){return[]}};
  function metrics(d){
    let m1=0,koc=0,best={rank:0,label:'—'};
    const scan=(obj,contest)=>{for(const [ys,v] of Object.entries(obj||{})){if(!inPeriod(ys))continue;const pt=resultScore(v);if(contest==='M-1')m1+=pt;else koc+=pt;const rr=resultRank(v);if(rr>best.rank)best={rank:rr,label:`${contest} ${stageLabel(v)}`};}};
    scan(d.m1,'M-1');scan(d.koc,'KOC');
    const bonus=bonusRows(d).filter(r=>inPeriod(r.year)).reduce((s,r)=>s+(+r.points||0),0);
    const total=m1+koc+bonus;
    const metric=state.scope==='m1'?m1:state.scope==='koc'?koc:total;
    return{d,name:d.name,m1,koc,bonus,total,metric,best:best.label};
  }
  function rows(){return DB.map(metrics).filter(x=>x.metric>0).sort((a,b)=>b.metric-a.metric||b.total-a.total||a.name.localeCompare(b.name,'ja')).map((x,i)=>({...x,rank:i+1}));}
  const scopeLabel=()=>state.scope==='m1'?'M-1 POWER':state.scope==='koc'?'KOC POWER':'TOTAL POWER';
  const periodLabel=()=>state.period==='recent3'?'2023–2025':state.period==='2025'?'2025':'ALL RECORDS / THROUGH 2025';
  function stackHtml(x){
    const denom=Math.max(1,x.total),m=x.m1/denom*100,k=x.koc/denom*100,b=x.bonus/denom*100;
    return `<div class="tp-stackwrap"><div class="tp-stack"><i class="m1" style="width:${m}%"></i><i class="koc" style="width:${k}%"></i><i class="bonus" style="width:${b}%"></i></div><div class="tp-stacklabel"><span class="m1">M-1 ${x.m1}</span><span class="koc">KOC ${x.koc}</span><span class="bonus">BONUS ${x.bonus}</span></div></div>`;
  }
  function renderTop(data){
    const top=data.slice(0,10),wrap=document.getElementById('tpTopList');
    document.getElementById('tpTopCaption').textContent=`${periodLabel()} / ${scopeLabel()} — M-1・KOC・BONUSの内訳`;
    wrap.innerHTML=top.map(x=>`<div class="tp-toprow" data-tp-name="${esc(x.name)}"><span class="tp-rank">${String(x.rank).padStart(2,'0')}</span><span class="tp-team"><b>${esc(x.name)}</b><small>${esc(x.best)}</small></span>${stackHtml(x)}<span class="tp-score"><b>${x.metric}</b><span>${scopeLabel()}</span></span></div>`).join('');
  }
  function renderComposition(data){
    const top=data.slice(0,10),wrap=document.getElementById('tpCompList');
    wrap.innerHTML=top.map(x=>{const den=Math.max(1,x.total),m=x.m1/den*100,k=x.koc/den*100,b=x.bonus/den*100;return`<div class="tp-comprow" data-tp-name="${esc(x.name)}"><b>${String(x.rank).padStart(2,'0')} ${esc(x.name)}</b><span class="tp-compbar"><i class="m1" style="width:${m}%"></i><i class="koc" style="width:${k}%"></i><i class="bonus" style="width:${b}%"></i></span><em>${x.total}</em></div>`}).join('');
  }
  function renderTiers(data){
    const tiers=[['50 pt +',x=>x.metric>=50],['30–49 pt',x=>x.metric>=30&&x.metric<50],['20–29 pt',x=>x.metric>=20&&x.metric<30],['10–19 pt',x=>x.metric>=10&&x.metric<20],['1–9 pt',x=>x.metric>=1&&x.metric<10]];
    const total=data.length||1;
    document.getElementById('tpTierGrid').innerHTML=tiers.map(([label,fn])=>{const n=data.filter(fn).length;return`<div class="tp-tier"><span>${label}</span><b>${n}</b><small>${(n/total*100).toFixed(1)}% OF SCORING TEAMS</small></div>`}).join('');
  }
  function renderTable(data){
    const q=state.query.trim().toLowerCase(),filtered=q?data.filter(x=>x.name.toLowerCase().includes(q)||(x.d.aliases||[]).some(a=>String(a).toLowerCase().includes(q))):data;
    const body=filtered.filter(x=>q||x.rank>10).slice(0,state.limit),wrap=document.getElementById('tpTableWrap');
    document.getElementById('tpRankCount').textContent=`${filtered.length} TEAMS / ${periodLabel()}`;
    wrap.innerHTML=`<table class="tp-table"><thead><tr><th>RANK</th><th>TEAM</th><th>${scopeLabel()}</th><th>M-1</th><th>KOC</th><th>BONUS</th><th>BEST</th></tr></thead><tbody>${body.map(x=>`<tr><td>${x.rank}</td><td data-tp-name="${esc(x.name)}">${esc(x.name)}</td><td class="mainpt">${x.metric}</td><td class="m1pt">${x.m1}</td><td class="kocpt">${x.koc}</td><td class="bonuspt">${x.bonus?`+${x.bonus}`:'—'}</td><td>${esc(x.best)}</td></tr>`).join('')}</tbody></table>`;
    const more=document.getElementById('tpMore');more.hidden=body.length>=filtered.filter(x=>q||x.rank>10).length;
  }
  let hits=[];
  function drawLandscape(data){
    const canvas=document.getElementById('tpLandscapeCanvas');if(!canvas)return;
    const shown=[...data].sort((a,b)=>b.total-a.total).slice(0,70),r=canvas.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1),w=Math.max(320,r.width||320),h=Math.max(280,r.height||365);canvas.width=w*dpr;canvas.height=h*dpr;const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);hits=[];
    const pad={l:36,r:18,t:18,b:34},pw=w-pad.l-pad.r,ph=h-pad.t-pad.b,maxX=Math.max(1,...shown.map(x=>x.m1)),maxY=Math.max(1,...shown.map(x=>x.koc)),maxB=Math.max(1,...shown.map(x=>x.bonus));ctx.font='8px Arial';ctx.textBaseline='middle';
    for(let i=0;i<=4;i++){const yy=pad.t+ph-ph*i/4;ctx.strokeStyle='rgba(30,30,30,.10)';ctx.beginPath();ctx.moveTo(pad.l,yy);ctx.lineTo(w-pad.r,yy);ctx.stroke();ctx.fillStyle='#77736c';ctx.textAlign='right';ctx.fillText(String(Math.round(maxY*i/4)),pad.l-5,yy)}
    for(let i=0;i<=4;i++){const xx=pad.l+pw*i/4;ctx.strokeStyle='rgba(30,30,30,.08)';ctx.beginPath();ctx.moveTo(xx,pad.t);ctx.lineTo(xx,pad.t+ph);ctx.stroke();ctx.fillStyle='#77736c';ctx.textAlign='center';ctx.fillText(String(Math.round(maxX*i/4)),xx,h-pad.b+13)}
    ctx.fillStyle='#77736c';ctx.textAlign='left';ctx.fillText('KOC',2,10);ctx.textAlign='right';ctx.fillText('M-1',w-2,h-8);
    const labels=new Set(shown.slice(0,12).map(x=>x.name));
    shown.forEach(x=>{const cx=pad.l+(x.m1/maxX)*pw,cy=pad.t+ph-(x.koc/maxY)*ph,rr=4+(x.bonus?Math.sqrt(x.bonus/maxB)*9:0),balance=x.m1+x.koc?x.m1/(x.m1+x.koc):.5;color=balance>.68?'rgba(216,65,61,.68)':balance<.32?'rgba(78,130,190,.68)':'rgba(216,166,46,.70)';ctx.fillStyle=color;ctx.strokeStyle='rgba(30,30,30,.48)';ctx.beginPath();ctx.arc(cx,cy,rr,0,Math.PI*2);ctx.fill();ctx.stroke();hits.push({x:cx,y:cy,r:rr+7,row:x});if(labels.has(x.name)){ctx.fillStyle='#403d38';ctx.textAlign='left';ctx.fillText(x.name,cx+rr+3,cy)}});
  }
  function hitAt(e){const c=document.getElementById('tpLandscapeCanvas'),r=c.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;return hits.find(p=>Math.hypot(x-p.x,y-p.y)<=p.r)}
  function bindCanvas(){const c=document.getElementById('tpLandscapeCanvas'),tip=document.getElementById('tpLandscapeTip');if(!c||!tip)return;c.addEventListener('pointermove',e=>{const p=hitAt(e);if(!p){tip.classList.remove('show');return}const box=c.parentElement.getBoundingClientRect(),x=p.row;tip.innerHTML=`<b>${esc(x.name)}</b><br>TOTAL ${x.total} / M-1 ${x.m1} / KOC ${x.koc}<br>BONUS +${x.bonus} / ${esc(x.best)}`;tip.style.left=Math.min(e.clientX-box.left+10,box.width-190)+'px';tip.style.top=(e.clientY-box.top+8)+'px';tip.classList.add('show')});c.addEventListener('pointerleave',()=>tip.classList.remove('show'));c.addEventListener('click',e=>{const p=hitAt(e);if(p&&typeof openD==='function')openD(p.row.name)})}
  function wireNames(){root.querySelectorAll('[data-tp-name]').forEach(el=>{el.onclick=()=>{if(typeof openD==='function')openD(el.dataset.tpName)}})}
  function render(){const data=rows();renderTop(data);renderComposition(data);renderTiers(data);renderTable(data);drawLandscape(data);wireNames();document.querySelectorAll('[data-tp-period]').forEach(b=>b.classList.toggle('on',b.dataset.tpPeriod===state.period));document.querySelectorAll('[data-tp-scope]').forEach(b=>b.classList.toggle('on',b.dataset.tpScope===state.scope));}
  document.getElementById('tpPeriod')?.addEventListener('click',e=>{const b=e.target.closest('[data-tp-period]');if(!b)return;state.period=b.dataset.tpPeriod;state.limit=40;render()});
  document.getElementById('tpScope')?.addEventListener('click',e=>{const b=e.target.closest('[data-tp-scope]');if(!b)return;state.scope=b.dataset.tpScope;state.limit=40;render()});
  const tpSearch=document.getElementById('tpSearch');
  const tpQuickSearch=document.getElementById('tpQuickSearch');
  const applyTpSearch=(value,source)=>{
    state.query=value;state.limit=40;
    if(tpSearch&&source!==tpSearch)tpSearch.value=value;
    if(tpQuickSearch&&source!==tpQuickSearch)tpQuickSearch.value=value;
    renderTable(rows());wireNames();
  };
  tpSearch?.addEventListener('input',e=>applyTpSearch(e.target.value,e.target));
  tpQuickSearch?.addEventListener('input',e=>applyTpSearch(e.target.value,e.target));
  tpQuickSearch?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();document.querySelector('.tp-ranking')?.scrollIntoView({behavior:'smooth',block:'start'})}});
  document.getElementById('tpMore')?.addEventListener('click',()=>{state.limit+=50;renderTable(rows());wireNames()});
  document.getElementById('tpDetailToggle')?.addEventListener('click',e=>{const on=document.body.classList.toggle('total-detail-open');e.currentTarget.setAttribute('aria-expanded',on?'true':'false');e.currentTarget.textContent=on?'DETAIL FILTER ↑':'DETAIL FILTER ↘';if(on)requestAnimationFrame(()=>document.getElementById('search')?.scrollIntoView({behavior:'smooth',block:'start'}))});
  document.addEventListener('click',e=>{const t=e.target.closest('[data-priority-target],[data-priority-nav]');if(t&&((t.dataset.priorityTarget||t.dataset.priorityNav)==='total'))requestAnimationFrame(()=>requestAnimationFrame(render))},true);
  let rt;addEventListener('resize',()=>{if(!document.body.classList.contains('priority-total'))return;clearTimeout(rt);rt=setTimeout(()=>drawLandscape(rows()),120)});
  bindCanvas();render();
  window.M1KOC_TOTAL_POWER={render,version:'v253',state};
  window.M1KOC_CHECKPOINT={...(window.M1KOC_CHECKPOINT||{}),version:'v235',focus:'TOTAL POWER editorial ranking + composition + landscape',checked_at:'2026-09-15'};
})();

/* v236 true tab panels + mobile recovery */
(()=>{
  const body=document.body;
  const tabs=document.getElementById('primaryTabs');
  if(!body||!tabs)return;
  const after=fn=>requestAnimationFrame(()=>requestAnimationFrame(fn));
  const hideHomeDigestFor=(name)=>{
    const feature=document.getElementById('edFeature');
    const lower=document.getElementById('edLower');
    if(feature)feature.style.removeProperty('display');
    if(lower)lower.style.removeProperty('display');
    body.classList.toggle('v236-agency-digest',name==='agency');
    body.classList.toggle('v236-forecast-digest',name==='forecast');
  };
  function ensureStats(){
    try{
      const has=o=>o&&Object.keys(o).length>0;
      const champions=new Set();
      for(const d of DB){for(const obj of [d.m1||{},d.koc||{}])for(const v of Object.values(obj))if(/優勝/.test(v))champions.add(d.name)}
      const set=(id,val)=>{const el=document.getElementById(id);if(el)el.textContent=Number(val).toLocaleString('ja-JP')};
      set('edTotal',DB.length);set('edM1',DB.filter(d=>has(d.m1)).length);set('edKoc',DB.filter(d=>has(d.koc)).length);set('edChamp',champions.size);
    }catch(_e){}
  }
  function sync(name){
    hideHomeDigestFor(name);
    ensureStats();
    if(name==='total')after(()=>window.M1KOC_TOTAL_POWER?.render?.());
    if(name==='agency')after(()=>{window.M1KOC_HOME_EDITORIAL?.render?.();window.M1KOC_RENDER_AGENCY_EVOLUTION?.();try{window.dispatchEvent(new Event('resize'))}catch(_e){}});
    if(name==='forecast')after(()=>{window.M1KOC_HOME_EDITORIAL?.render?.();const b=document.querySelector('[data-discovery-tab="forecast"]');if(b&&!b.classList.contains('on'))b.click();try{window.dispatchEvent(new Event('resize'))}catch(_e){}});
  }
  // Keep selected panel deterministic even if legacy listeners miss a tap.
  document.addEventListener('click',e=>{
    const btn=e.target.closest('[data-priority-target]');
    if(!btn)return;
    const name=btn.dataset.priorityTarget;
    after(()=>sync(name));
  },true);
  // Mobile NEXT STAR: details stay hidden unless explicitly requested.
  const next=document.querySelector('.nextstar.nextstar-v2');
  if(next&&!document.getElementById('nextstarDetailToggle')){
    const b=document.createElement('button');b.type='button';b.id='nextstarDetailToggle';b.className='nextstar-detail-toggle';b.textContent='DETAIL FILTER ↘';b.setAttribute('aria-expanded','false');
    next.appendChild(b);
    b.addEventListener('click',()=>{const search=document.getElementById('search');const on=search?.classList.toggle('nextstar-detail-open');b.textContent=on?'DETAIL FILTER ↑':'DETAIL FILTER ↘';b.setAttribute('aria-expanded',on?'true':'false');if(on)search?.scrollIntoView({behavior:'smooth',block:'start'})});
  }
  ensureStats();
  after(()=>sync(window.M1KOC_PRIORITY_VIEW?.get?.()||'total'));
  window.M1KOC_CHECKPOINT={...(window.M1KOC_CHECKPOINT||{}),version:'v236',focus:'true priority tabs + mobile layout recovery',checked_at:'2026-09-15'};
})();


/* v241 checkpoint */
window.M1KOC_CHECKPOINT={...(window.M1KOC_CHECKPOINT||{}),version:'v241',focus:'unified editorial design across all internal views',checked_at:'2026-09-15'};


/* v242 persistent editorial shell */
(()=>{
  document.body.classList.add('editorial-ui');
  const keep=()=>document.body.classList.add('editorial-ui');
  document.addEventListener('click',()=>requestAnimationFrame(keep),true);
  window.addEventListener('hashchange',keep);
  window.M1KOC_CHECKPOINT={...(window.M1KOC_CHECKPOINT||{}),version:'v242',focus:'full readability, size and mobile-width audit across internal pages; update log moved to cover',checked_at:'2026-09-15'};
})();


/* v243 cover live stats + release marker */
(()=>{
  if(typeof DB==='undefined')return;
  const total=document.getElementById('coverCount');
  const champ=document.getElementById('coverChampCount');
  if(total)total.textContent=DB.length.toLocaleString('ja-JP')+' 組';
  if(champ){
    const winners=new Set();
    DB.forEach(d=>{
      [d.m1||{},d.koc||{}].forEach(obj=>Object.values(obj).forEach(v=>{if(/優勝/.test(String(v)))winners.add(d.name)}));
    });
    champ.textContent=winners.size.toLocaleString('ja-JP')+' 組';
  }
  window.M1KOC_CHECKPOINT={...(window.M1KOC_CHECKPOINT||{}),version:'v243',focus:'final cover design + update log only on cover',checked_at:'2026-09-15'};
})();



/* v246 — legacy cover controllers removed; core.js is sole cover controller */
window.M1KOC_CHECKPOINT={...(window.M1KOC_CHECKPOINT||{}),version:'v246',focus:'single cover controller + mobile performance reset',checked_at:'2026-09-15'};

window.M1KOC_CHECKPOINT={...(window.M1KOC_CHECKPOINT||{}),version:"v247",focus:"deferred app boot + strict iPhone cover",checked_at:"2026-09-15"};

/* v248: finalist forecasts exclude past champions of the selected contest. */
window.M1KOC_CHECKPOINT={...(window.M1KOC_CHECKPOINT||{}),version:'v248',focus:'exclude prior M-1/KOC champions from finalist forecast and historical backtests',checked_at:'2026-09-15'};


/* v249 M-1 LAST YEAR browser */
(()=>{
  if(typeof DB==='undefined')return;
  const body=document.body;
  const panel=document.getElementById('lastYearPanel');
  const modebar=document.getElementById('nextstarModebar');
  if(!panel||!modebar)return;
  const yearsEl=document.getElementById('lastYearYears');
  const select=document.getElementById('lastYearSelect');
  const sort=document.getElementById('lastYearSort');
  const activeCheck=document.getElementById('lastYearActive');
  const list=document.getElementById('lastYearList');
  const feature=document.getElementById('lastYearFeature');
  const summary=document.getElementById('lastYearSummary');
  const countEl=document.getElementById('lastYearCount');
  const big=document.getElementById('lastYearBig');
  const formedEl=document.getElementById('lastYearFormed');
  const state={year:2026,scope:'m1'};
  const YEARS=Array.from({length:15},(_,i)=>2026+i);
  const score=v=>/優勝/.test(v)?15:/^決勝/.test(v)?5:/準決勝/.test(v)?3:/準々決勝/.test(v)?2:/3回戦|３回戦/.test(v)?1:0;
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  const formedYear=d=>{const m=String(d.formed||'').match(/(19|20)\d{2}/);return m?+m[0]:null};
  const m1Power=d=>Object.values(d.m1||{}).reduce((a,v)=>a+score(v),0);
  const latestM1=d=>Math.max(0,...Object.keys(d.m1||{}).map(Number).filter(Number.isFinite));
  const bestM1=d=>{const vals=Object.values(d.m1||{}); if(!vals.length)return '—'; return vals.slice().sort((a,b)=>score(b)-score(a))[0]};
  const status=d=>{if(d.activity_status==='dissolved')return 'dissolved';if(d.activity_status==='active'||d.activity_status==='mixed'||d.activity_verified||d.recent_activity_verified||(+d.recent_activity_year>=2024))return 'active';return 'unknown'};
  const eligibleRow=d=>formedYear(d)===state.year-15 && (state.scope==='all'||Object.keys(d.m1||{}).length>0) && (!activeCheck.checked||status(d)!=='dissolved');
  const rows=()=>DB.filter(eligibleRow);
  const sortRows=arr=>arr.sort((a,b)=>{
    if(sort.value==='name')return a.name.localeCompare(b.name,'ja');
    if(sort.value==='recent')return latestM1(b)-latestM1(a)||m1Power(b)-m1Power(a)||a.name.localeCompare(b.name,'ja');
    return m1Power(b)-m1Power(a)||latestM1(b)-latestM1(a)||a.name.localeCompare(b.name,'ja');
  });
  function countForYear(y){return DB.filter(d=>formedYear(d)===y-15&&(state.scope==='all'||Object.keys(d.m1||{}).length>0)&&(!activeCheck.checked||status(d)!=='dissolved')).length}
  function renderYears(){
    select.innerHTML=YEARS.map(y=>`<option value="${y}">${y}（${y-15}年結成）</option>`).join('');select.value=state.year;
    yearsEl.innerHTML=YEARS.map(y=>`<button type="button" class="lastyear-year ${y===state.year?'on':''}" data-lastyear-year="${y}"><b>${y}</b><span>${countForYear(y)}組</span></button>`).join('');
    yearsEl.querySelectorAll('[data-lastyear-year]').forEach(b=>b.onclick=()=>{state.year=+b.dataset.lastyearYear;select.value=state.year;render()});
  }
  function render(){
    body.classList.toggle('nextstar-mode-lastyear',body.classList.contains('nextstar-mode-lastyear'));
    big.textContent=state.year;formedEl.textContent=`${state.year-15}年結成`;
    const arr=sortRows(rows());
    const verified=arr.filter(d=>d.formed_verified===true&&d.formed_research_status!=='UNRESOLVED').length;
    const active=arr.filter(d=>status(d)==='active').length;
    const m1ers=arr.filter(d=>Object.keys(d.m1||{}).length).length;
    summary.innerHTML=`<div class="lastyear-stat"><small>LISTED</small><b>${arr.length}</b></div><div class="lastyear-stat"><small>FORMED VERIFIED</small><b>${verified}</b></div><div class="lastyear-stat"><small>ACTIVE / RECENT</small><b>${active}</b></div><div class="lastyear-stat"><small>M-1 RECORD</small><b>${m1ers}</b></div>`;
    const top=arr.filter(d=>Object.keys(d.m1||{}).length).slice(0,5);
    feature.innerHTML=top.map((d,i)=>`<article data-ly-detail="${esc(d.name)}"><span class="rank">${String(i+1).padStart(2,'0')}</span><div><h3>${esc(d.name)}</h3><p>${esc(d.agency_verified&&d.agency?d.agency:'所属未確認')} / ${esc(bestM1(d))}${d.formed_verified===false||d.formed_research_status==='UNRESOLVED'?' / 結成年暫定':''}</p></div><b>${m1Power(d)} pt</b></article>`).join('');
    countEl.textContent=`${arr.length} UNITS`;
    list.innerHTML=arr.length?arr.map((d,i)=>{const st=status(d);const verifiedForm=d.formed_verified===true&&d.formed_research_status!=='UNRESOLVED';return `<div class="lastyear-row" data-ly-detail="${esc(d.name)}"><span class="ly-rank">${String(i+1).padStart(2,'0')}</span><div class="ly-name"><b>${esc(d.name)}</b><span>${state.year} LAST YEAR / 結成 ${esc(d.formed||state.year-15)}年</span>${!verifiedForm?'<em class="ly-badge warn">結成年 暫定</em>':''}${st==='active'?'<em class="ly-badge active">活動確認</em>':st==='dissolved'?'<em class="ly-badge">解散確認</em>':''}</div><span class="ly-agency">${esc(d.agency_verified&&d.agency?d.agency:'所属未確認')}</span><div class="ly-cell ly-best"><small>BEST</small><b>${esc(bestM1(d))}</b></div><div class="ly-cell ly-apps"><small>APPS</small><b>${Object.keys(d.m1||{}).length}</b></div><div class="ly-cell ly-latest"><small>LATEST</small><b>${latestM1(d)||'—'}</b></div><div class="ly-cell ly-power"><small>M-1 POWER</small><b>${m1Power(d)} pt</b></div></div>`}).join(''):'<div class="lastyear-empty">該当するユニットがありません。</div>';
    panel.querySelectorAll('[data-ly-detail]').forEach(el=>el.onclick=()=>window.M1KOC_OPEN_DETAIL?.(el.dataset.lyDetail));
    renderYears();
  }
  function setMode(mode){
    const last=mode==='lastyear';body.classList.toggle('nextstar-mode-lastyear',last);body.classList.toggle('nextstar-mode-finder',!last);
    modebar.querySelectorAll('[data-nextstar-mode]').forEach(b=>b.classList.toggle('on',b.dataset.nextstarMode===mode));
    if(last)render();
  }
  modebar.querySelectorAll('[data-nextstar-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.nextstarMode));
  select.onchange=()=>{state.year=+select.value;render()};
  sort.onchange=render;activeCheck.onchange=render;
  document.querySelectorAll('[data-lastyear-scope]').forEach(b=>b.onclick=()=>{state.scope=b.dataset.lastyearScope;document.querySelectorAll('[data-lastyear-scope]').forEach(x=>x.classList.toggle('on',x===b));render()});
  document.addEventListener('click',e=>{const t=e.target.closest('[data-priority-target="nextstar"],[data-priority-nav="nextstar"]');if(t&&!body.classList.contains('nextstar-mode-lastyear'))setMode('finder')},true);
  setMode('finder');renderYears();
  window.M1KOC_LAST_YEAR={setYear:y=>{if(YEARS.includes(+y)){state.year=+y;setMode('lastyear');render()}},version:'v249'};
})();

/* v251: approved cover copy lock + typography cleanup. */
window.M1KOC_CHECKPOINT={...(window.M1KOC_CHECKPOINT||{}),version:'v251',focus:'approved cover copy lock + door/top typography cleanup',checked_at:'2026-09-15'};


/* v252: full static audit + cover ENTER-only release marker. */
window.M1KOC_CHECKPOINT={...(window.M1KOC_CHECKPOINT||{}),version:'v252',focus:'full static audit + single ENTER cover + cover paint reduction',checked_at:'2026-09-15'};
