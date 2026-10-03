// Exactly one step advances per frame. A new step never receives the old step's time.
export function createSequence(isReduced=()=>false){
 let steps=[],index=0,time=0,done=null;
 return {get busy(){return index<steps.length},get time(){return time},play(next,complete){if(index<steps.length)return false;steps=next;index=0;time=0;done=complete;if(!steps.length){done?.();return true}steps[0].start?.();return true},update(dt){if(index>=steps.length)return;const step=steps[index];time+=Math.max(0,Math.min(.15,dt));const duration=isReduced()?Math.min(step.duration,.13):step.duration;const p=Math.min(1,time/Math.max(.001,duration));step.update?.(p);if(p<1)return;step.end?.();index++;time=0;if(index<steps.length)steps[index].start?.();else{const callback=done;done=null;callback?.()}},cancel(){steps=[];index=0;time=0;done=null}};
}
