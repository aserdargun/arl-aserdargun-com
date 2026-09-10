import {expect,it} from 'vitest'
import {validateCatalog,validateExperiment,validateLesson} from '@aserdargun/lab-core'
import {manifest,experiments,guidedLesson,initialRoute} from '../src/ils/catalog'
import concepts from '../src/ils/concepts.json'
import {scenarios} from '../src/core/scenarios'
import {chapters} from '../src/lessons/content'
it('describes the real scenarios and evidence boundaries',()=>{
 expect(validateCatalog(manifest,experiments,[guidedLesson],concepts.map(c=>c.id))).toEqual([])
 expect(experiments.map(e=>e.id)).toEqual(scenarios.map(s=>s.id))
 experiments.forEach((e,i)=>{expect(validateExperiment(e).ok).toBe(true);expect(e.title).toEqual(scenarios[i].title);expect(e.learningObjectives).toEqual([scenarios[i].lesson]);expect(e.config?.scenarioId).toBe(e.id)})
 expect(manifest.evidence.every(e=>e.verificationStatus==='not-applicable')).toBe(true)
})
it('maps the existing guide and ignores unsupported payloads',()=>{
 expect(validateLesson(guidedLesson).ok).toBe(true)
 expect(guidedLesson.steps.map(s=>s.explanation)).toEqual(chapters.map(c=>c.body))
 expect(initialRoute('?scenario=injection&lang=tr')).toEqual({scenario:'injection',lesson:false,locale:'tr'})
 expect(initialRoute('?scenario=injection&lesson=agent-runtime-101').scenario).toBe('revenue')
 expect(initialRoute('?scenario=constructor&ils=not-json').scenario).toBe('revenue')
})
