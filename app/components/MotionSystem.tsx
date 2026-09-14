'use client'

import {useEffect, useState} from 'react'
import {usePathname} from 'next/navigation'

export default function MotionSystem(){
  const [ready,setReady]=useState(false)
  const pathname=usePathname()

  useEffect(()=>{
    const root=document.documentElement
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)')
    const lowPower=window.matchMedia('(max-width: 900px)')
    const updateReduced=()=>root.classList.toggle('reduced-motion',reduced.matches)
    updateReduced(); reduced.addEventListener?.('change',updateReduced)

    document.querySelectorAll<HTMLElement>('.reveal,.section-head,.photo,.service,.standard-item,.review-card,.value-grid>div,.final-cta,.system,.feature-image').forEach(el=>{
      if(!el.dataset.reveal) el.dataset.reveal=''
    })
    document.querySelectorAll<HTMLElement>('.photo').forEach(el=>el.dataset.cursor='view')
    document.querySelectorAll<HTMLElement>('.primary,.quote-pill,.secondary,.feature-copy a,.review-card a,.service button').forEach(el=>el.dataset.magnetic='')
    document.querySelectorAll<HTMLElement>('.hero-img,.feature-image img').forEach(el=>{el.dataset.parallax=el.classList.contains('hero-img')?'0.025':'0.018'})

    let observer:IntersectionObserver|null=null
    if('IntersectionObserver' in window){
      observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(entry.isIntersecting){
          ;(entry.target as HTMLElement).classList.add('is-visible')
          observer?.unobserve(entry.target)
        }
      }),{threshold:.12,rootMargin:'0px 0px -45px'})
    }
    const observerTargets=document.querySelectorAll<HTMLElement>('[data-reveal]')
    observerTargets.forEach(el=>observer?.observe(el))
    if(!observer) observerTargets.forEach(el=>el.classList.add('is-visible'))

    document.querySelectorAll<HTMLElement>('.faq details').forEach((detail,i)=>{
      const summary=detail.querySelector('summary'); const panel=detail.querySelector('p')
      if(!summary||!panel)return
      const id=`yardify-faq-${i+1}`; panel.id=id; summary.setAttribute('aria-controls',id)
      const sync=()=>summary.setAttribute('aria-expanded',detail.open?'true':'false')
      sync(); detail.addEventListener('toggle',sync)
    })

    let scrollRaf=0, parallaxRaf=0
    const updateScroll=()=>{
      if(scrollRaf)return
      scrollRaf=requestAnimationFrame(()=>{
        scrollRaf=0
        const max=Math.max(1,document.documentElement.scrollHeight-innerHeight)
        root.style.setProperty('--scroll-progress',`${Math.min(100,Math.max(0,scrollY/max*100))}%`)
        document.body.classList.toggle('nav-scrolled',scrollY>28)
      })
    }
    const updateParallax=()=>{
      if(lowPower.matches||reduced.matches||parallaxRaf)return
      parallaxRaf=requestAnimationFrame(()=>{
        parallaxRaf=0
        document.querySelectorAll<HTMLElement>('[data-parallax]').forEach(el=>{
          const r=el.getBoundingClientRect(); if(r.bottom<0||r.top>innerHeight)return
          const speed=Number(el.dataset.parallax||.02)
          const y=(innerHeight/2-(r.top+r.height/2))*speed
          el.style.setProperty('--parallax-y',`${y.toFixed(2)}px`)
        })
      })
    }
    addEventListener('scroll',updateScroll,{passive:true}); addEventListener('scroll',updateParallax,{passive:true}); updateScroll(); updateParallax()

    let cursor:HTMLDivElement|undefined,cursorRaf=0
    let cx=innerWidth/2,cy=innerHeight/2,tx=cx,ty=cy
    if(finePointer.matches&&!reduced.matches){
      cursor=document.createElement('div'); cursor.className='cursor'; cursor.innerHTML='<span></span>'; document.body.appendChild(cursor)
      const label=cursor.querySelector('span') as HTMLSpanElement
      const move=(e:PointerEvent)=>{tx=e.clientX;ty=e.clientY}
      const tick=()=>{cx+=(tx-cx)*.18;cy+=(ty-cy)*.18;cursor!.style.transform=`translate3d(${cx}px,${cy}px,0)`;cursorRaf=requestAnimationFrame(tick)}; tick()
      const over=(e:Event)=>{const raw=e.target as HTMLElement;const el=raw?.closest<HTMLElement>('[data-cursor],[data-magnetic],a,button');const type=el?.dataset.cursor||(el?.matches('[data-magnetic]')?'hover':'');cursor!.classList.toggle('cursor-view',type==='view');cursor!.classList.toggle('cursor-drag',type==='drag');cursor!.classList.toggle('cursor-hover',type==='hover');label.textContent=type==='view'?'VIEW':type==='drag'?'DRAG':''}
      const out=()=>cursor?.classList.remove('cursor-view','cursor-drag','cursor-hover')
      document.addEventListener('pointerover',over); document.addEventListener('pointerout',out); addEventListener('pointermove',move,{passive:true})
      ;(cursor as any)._cleanup=()=>{document.removeEventListener('pointerover',over);document.removeEventListener('pointerout',out);removeEventListener('pointermove',move)}
    }

    const cleanups:Array<()=>void>=[]
    if(finePointer.matches&&!reduced.matches) document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach(el=>{
      const move=(e:PointerEvent)=>{const r=el.getBoundingClientRect();const x=Math.max(-7,Math.min(7,(e.clientX-r.left-r.width/2)/Math.max(1,r.width)*10));const y=Math.max(-7,Math.min(7,(e.clientY-r.top-r.height/2)/Math.max(1,r.height)*10));el.style.setProperty('--mag-x',`${x}px`);el.style.setProperty('--mag-y',`${y}px`)}
      const leave=()=>{el.style.setProperty('--mag-x','0px');el.style.setProperty('--mag-y','0px')}
      el.addEventListener('pointermove',move);el.addEventListener('pointerleave',leave);cleanups.push(()=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',leave)})
    })

    const timer=window.setTimeout(()=>setReady(true),reduced.matches?0:90)
    return()=>{clearTimeout(timer);observer?.disconnect();removeEventListener('scroll',updateScroll);removeEventListener('scroll',updateParallax);if(scrollRaf)cancelAnimationFrame(scrollRaf);if(parallaxRaf)cancelAnimationFrame(parallaxRaf);if(cursorRaf)cancelAnimationFrame(cursorRaf);reduced.removeEventListener?.('change',updateReduced);cleanups.forEach(fn=>fn());(cursor as any)?._cleanup?.();cursor?.remove()}
  },[pathname])

  const isDemo=pathname?.startsWith('/yardify/dashboard')||pathname?.startsWith('/yardify/automation')||pathname?.startsWith('/yardify/leads')
  return <>
    {!isDemo&&<>
      <div className={`site-loader ${ready?'site-loader-done':''}`} aria-hidden="true"><img src="/assets/yardify-logo.webp" alt=""/><span>YARDIFY · LANDSCAPING & CONSTRUCTION</span></div>
      <div className="global-progress" aria-hidden="true"/>
      <div className="floating-quote"><button type="button" data-magnetic onClick={()=>window.dispatchEvent(new CustomEvent('yardify:quote'))}>GET A FREE QUOTE <span>↗</span></button></div>
      <div className="mobile-cta"><button type="button" onClick={()=>window.dispatchEvent(new CustomEvent('yardify:quote'))}>GET A FREE QUOTE <span>↗</span></button></div>
    </>}
  </>
}
