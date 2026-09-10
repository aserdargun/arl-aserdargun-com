import {parseManifest, type ExperimentDefinition, type LessonDefinition} from '@aserdargun/lab-core'
import raw from '../../lab.manifest.json'
import rawExperiments from './experiments.json'
import {chapters} from '../lessons/content'
export const manifest=parseManifest(raw)
export const experiments=rawExperiments as ExperimentDefinition<{scenarioId:string}>[]
export const guidedLesson:LessonDefinition={schemaVersion:'0.1',id:'agent-runtime-101',title:manifest.lessons![0].title,concepts:manifest.concepts,steps:chapters.map((c,i)=>({id:`chapter-${i+1}`,title:c.title,explanation:c.body,experimentId:'revenue',focus:[c.zone],completion:{kind:'manual'}}))}
export function initialRoute(search:string):{scenario:string;lesson:boolean;locale:'en'|'tr'|undefined}{
 const p=new URLSearchParams(search),lesson=p.get('lesson')===guidedLesson.id,lang=p.get('lang')
 return {scenario:lesson?'revenue':experiments.find(e=>e.id===p.get('scenario'))?.id??'revenue',lesson,locale:lang==='en'||lang==='tr'?lang:undefined}
}
