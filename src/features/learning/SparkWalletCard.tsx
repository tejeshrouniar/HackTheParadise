import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { useHintWallet } from "./useHintWallet";
export function SparkWalletCard({onSignIn}:{onSignIn:()=>void}) {
  const wallet=useHintWallet();
  const {user}=useAuth();
  const [history,setHistory]=useState<{amount:number;created_at:string}[]>([]);
  const [historyError,setHistoryError]=useState(false);
  useEffect(()=>{
    setHistory([]);setHistoryError(false);
    if(!user||!supabase)return;
    let active=true;
    void supabase.from("spark_ledger").select("amount,created_at").eq("user_id",user.id).order("id",{ascending:false}).limit(10).then(({data,error})=>{
      if(active){setHistory(data??[]);setHistoryError(!!error);}
    });
    return()=>{active=false;};
  },[user?.id,wallet.balance]);
  return <section className="sc-card sc-settings-card sc-wallet-card">
    <h2>Sparks</h2>
    {!user?<><p>Your account keeps your sparks and unlocked help across devices.</p><button className="sc-button" onClick={onSignIn}>Sign in</button></>:<>
      <p className="sc-wallet-balance">{wallet.balance??"—"} <span>sparks</span></p>
      <p>Hints cost 10. Solutions cost 20. Each unlock is yours to keep.</p>
      <small>30 welcome sparks per account. Spark purchases are not available yet.</small>
      {wallet.error&&<p role="status">{wallet.error}</p>}
      <button className="sc-button secondary" onClick={wallet.refresh}>Refresh balance</button>
      <details><summary>Recent activity</summary>
        {historyError?<p>Activity could not load. Refresh to retry.</p>:history.length?<ul>{history.map((entry,i)=><li key={i}><time>{new Date(entry.created_at).toLocaleString()}</time><strong>{entry.amount>0?"+":""}{entry.amount} sparks</strong></li>)}</ul>:<p>No activity yet.</p>}
      </details>
    </>}
  </section>;
}
