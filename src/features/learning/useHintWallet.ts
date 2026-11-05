import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
// Development economy: earned currency is derived from unique completions.
// Purchases are device-local until a server-side ledger is introduced.
export function useHintWallet() {
  const {user}=useAuth();
  const [wallet,setWallet]=useState<{balance:number;unlocks:{lesson_id:number;kind:string}[]}|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const owner=useRef(user?.id);owner.current=user?.id;
  useEffect(()=>{
    setWallet(null);setError("");setBusy(false);
    if(!user||!supabase)return;
    let active=true;
    const refresh=async()=>{
      const {data,error}=await supabase!.rpc("spark_wallet");
      if(!active)return;
      if(error){setWallet(null);setError("Wallet unavailable. Apply the sparks database migration, then refresh.");}
      else {setWallet(data);setError("");}
    };
    void refresh();window.addEventListener("focus",refresh);window.addEventListener("sparks-changed",refresh);
    return()=>{active=false;window.removeEventListener("focus",refresh);window.removeEventListener("sparks-changed",refresh);};
  },[user?.id]);
  async function buy(lesson:number,item:"hint"|"solution") {
    if(!user||!supabase||busy)return;
    const id=user.id;setBusy(true);setError("");
    try{
      const {data,error}=await supabase.rpc("spend_sparks",{lesson,item});
      if(owner.current!==id)return;
      if(error)throw error;
      setWallet(data);window.dispatchEvent(new Event("sparks-changed"));
    }catch{if(owner.current===id)setError("Purchase unconfirmed. Retry safely; each unlock is charged only once.");}
    finally{if(owner.current===id)setBusy(false);}
  }
  return {balance:wallet?.balance??null,busy,error,signedIn:!!user,buy,owns:(id:number,kind:string)=>!!wallet?.unlocks.some(x=>x.lesson_id===id&&x.kind===kind)};
}
