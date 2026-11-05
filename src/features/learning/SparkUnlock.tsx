import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { useHintWallet } from "./useHintWallet";
export function SparkUnlock({id,kind,onUse}:{id:number;kind:"hint"|"solution";onUse?:(code:string)=>void}){
 const wallet=useHintWallet();const price=kind==="hint"?10:20;
 const {user}=useAuth();
 const owned=wallet.owns(id,kind);
 const [content,setContent]=useState<{owner:string;id:number;kind:string;text:string}|null>(null);
 const [error,setError]=useState("");
 const [attempt,retry]=useState(0);
 useEffect(()=>{
   setContent(null);setError("");
   if(!owned||!user||!supabase)return;
   let active=true;
   void supabase.rpc("get_spark_content",{lesson:id,item:kind}).then(({data,error})=>{
     if(!active)return;
     if(error||typeof data!=="string")setError("Your unlock is saved, but its content could not load.");
     else setContent({owner:user.id,id,kind,text:data});
   });
   return()=>{active=false;};
 },[owned,user?.id,id,kind,attempt]);
 const text=content?.owner===user?.id&&content?.id===id&&content?.kind===kind?content.text:null;
 return <div className="sc-spark-unlock">
 <p>{wallet.signedIn ? "Account wallet · "+(wallet.balance??"…")+" sparks" : "Sign in to save and spend sparks."}</p>
 {owned ? text!==null ? <>{kind==="hint"?<p>{text}</p>:<pre><code>{text}</code></pre>}{onUse&&<button className="sc-button secondary" onClick={()=>onUse(text)}>Use this code</button>}</> : <p role="status">{error||"Loading your unlock…"}{error&&<button className="sc-link" onClick={()=>retry(n=>n+1)}>Retry</button>}</p> : <>
 <button className="sc-button" disabled={wallet.busy||wallet.balance===null||wallet.balance<price} onClick={()=>void wallet.buy(id,kind)}>{wallet.busy?"Confirming…":"Unlock "+kind+" · "+price+" sparks"}</button>
 {wallet.balance!==null&&wallet.balance<price&&<small>Not enough sparks. Your balance has not changed.</small>}
 </>}
 <small>One-time unlock · saved to your account</small>
 {wallet.error&&<p role="status">{wallet.error}</p>}
 {wallet.signedIn&&<button className="sc-link" onClick={wallet.refresh}>Refresh wallet</button>}
 </div>;
}
