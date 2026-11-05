import type { PropsWithChildren } from "react";
import { useHintWallet } from "./useHintWallet";
export function SparkUnlock({id,kind,children}:{id:number;kind:"hint"|"solution"}&PropsWithChildren){
 const wallet=useHintWallet();const price=kind==="hint"?10:20;
 return <div className="sc-spark-unlock">
 <p>{wallet.signedIn ? "Account wallet · "+(wallet.balance??"…")+" sparks" : "Sign in to save and spend sparks."}</p>
 {wallet.owns(id,kind)?children:<button className="sc-button" disabled={wallet.busy||wallet.balance===null||wallet.balance<price} onClick={()=>void wallet.buy(id,kind)}>{wallet.busy?"Confirming…":"Unlock "+kind+" · "+price+" sparks"}</button>}
 {wallet.error&&<p role="status">{wallet.error}</p>}
 </div>;
}
