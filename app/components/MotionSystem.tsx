'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

type MotionPointer = {
  element: HTMLDivElement
  cleanup: () => void
}

export default function MotionSystem() {
  const [ready, setReady] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const root = document.documentElement
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const lowPower = window.matchMedia('(max-width: 900px)')

    const updateReduced = () => {
      root.classList.toggle('reduced-motion', reduced.matches)
    }
    updateReduced()
    reduced.addEventListener('change', updateReduced)

    let revealObserver: IntersectionObserver | null = null
    let sectionObserver: IntersectionObserver | null = null

    const observeReveals = () => {
      revealObserver?.disconnect()
      const elements = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)')

      if (!('IntersectionObserver' in window)) {
        elements.forEach((el) => el.classList.add('is-visible'))
        return
      }

      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const element = entry.target as HTMLElement
          element.classList.add('is-visible')
          revealObserver?.unobserve(element)
        })
      }, { threshold: 0.12, rootMargin: '0px 0px -50px' })

      elements.forEach((el) => revealObserver?.observe(el))
    }

    observeReveals()

    if ('IntersectionObserver' in window) {
      sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const id = (entry.target as HTMLElement).id
          if (!id) return

          document.querySelectorAll<HTMLAnchorElement>('.nav nav a[href*="#"], .site-header .nav-link[href*="#"]').forEach((link) => {
            const href = link.getAttribute('href') || ''
            link.dataset.active = href.endsWith(`#${id}`) ? 'true' : 'false'
          })
        })
      }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 })

      document.querySelectorAll<HTMLElement>('main section[id]').forEach((section) => {
        sectionObserver?.observe(section)
      })
    }

    const mutation = new MutationObserver(() => observeReveals())
    mutation.observe(document.body, { childList: true, subtree: true })

    let scrollRaf = 0
    let parallaxRaf = 0

    const updateScroll = () => {
      if (scrollRaf) return
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
        const progress = Math.min(100, Math.max(0, (window.scrollY / max) * 100))
        root.style.setProperty('--scroll-progress', `${progress}%`)
        document.body.classList.toggle('nav-scrolled', window.scrollY > 28)
      })
    }

    const updateParallax = () => {
      if (lowPower.matches || reduced.matches || parallaxRaf) return
      parallaxRaf = requestAnimationFrame(() => {
        parallaxRaf = 0
        document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((element) => {
          const rect = element.getBoundingClientRect()
          if (rect.bottom < 0 || rect.top > window.innerHeight) return
          const speed = Number(element.dataset.parallax || '0.02')
          const y = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * speed
          element.style.setProperty('--parallax-y', `${y.toFixed(2)}px`)
        })
      })
    }

    window.addEventListener('scroll', updateScroll, { passive: true })
    window.addEventListener('scroll', updateParallax, { passive: true })
    updateScroll()
    updateParallax()

    let cursorState: MotionPointer | null = null
    let cursorRaf = 0
    let cursorX = window.innerWidth / 2
    let cursorY = window.innerHeight / 2
    let targetX = cursorX
    let targetY = cursorY

    const onPointerMove = (event: PointerEvent) => {
      targetX = event.clientX
      targetY = event.clientY
    }

    if (finePointer.matches && !reduced.matches) {
      const element = document.createElement('div')
      element.className = 'cursor'
      element.innerHTML = '<span></span>'
      document.body.appendChild(element)
      const label = element.querySelector('span') as HTMLSpanElement | null

      const tick = () => {
        cursorX += (targetX - cursorX) * 0.18
        cursorY += (targetY - cursorY) * 0.18
        element.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`
        cursorRaf = requestAnimationFrame(tick)
      }
      tick()

      const updateCursor = (event: Event) => {
        const target = event.target
        if (!(target instanceof HTMLElement)) return
        const interactive = target.closest<HTMLElement>('[data-cursor], [data-magnetic], a, button')
        const type = interactive?.dataset.cursor || (interactive?.matches('[data-magnetic]') ? 'hover' : '')
        element.classList.toggle('cursor-view', type === 'view')
        element.classList.toggle('cursor-drag', type === 'drag')
        element.classList.toggle('cursor-hover', type === 'hover')
        if (label) label.textContent = type === 'view' ? 'VIEW' : type === 'drag' ? 'DRAG' : ''
      }

      const clearCursor = () => {
        element.classList.remove('cursor-view', 'cursor-drag', 'cursor-hover')
        if (label) label.textContent = ''
      }

      document.addEventListener('pointerover', updateCursor)
      document.addEventListener('pointerout', clearCursor)
      window.addEventListener('pointermove', onPointerMove, { passive: true })

      cursorState = {
        element,
        cleanup: () => {
          document.removeEventListener('pointerover', updateCursor)
          document.removeEventListener('pointerout', clearCursor)
          window.removeEventListener('pointermove', onPointerMove)
        }
      }
    }

    const magneticCleanup: Array<() => void> = []
    if (finePointer.matches && !reduced.matches) {
      document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((element) => {
        const move = (event: PointerEvent) => {
          const rect = element.getBoundingClientRect()
          const x = Math.max(-7, Math.min(7, ((event.clientX - rect.left - rect.width / 2) / Math.max(1, rect.width)) * 10))
          const y = Math.max(-7, Math.min(7, ((event.clientY - rect.top - rect.height / 2) / Math.max(1, rect.height)) * 10))
          element.style.setProperty('--mag-x', `${x}px`)
          element.style.setProperty('--mag-y', `${y}px`)
        }
        const leave = () => {
          element.style.setProperty('--mag-x', '0px')
          element.style.setProperty('--mag-y', '0px')
        }
        element.addEventListener('pointermove', move)
        element.addEventListener('pointerleave', leave)
        magneticCleanup.push(() => {
          element.removeEventListener('pointermove', move)
          element.removeEventListener('pointerleave', leave)
        })
      })
    }

    const timer = window.setTimeout(() => setReady(true), reduced.matches ? 0 : 90)

    return () => {
      window.clearTimeout(timer)
      mutation.disconnect()
      revealObserver?.disconnect()
      sectionObserver?.disconnect()
      window.removeEventListener('scroll', updateScroll)
      window.removeEventListener('scroll', updateParallax)
      if (scrollRaf) cancelAnimationFrame(scrollRaf)
      if (parallaxRaf) cancelAnimationFrame(parallaxRaf)
      if (cursorRaf) cancelAnimationFrame(cursorRaf)
      reduced.removeEventListener('change', updateReduced)
      magneticCleanup.forEach((cleanup) => cleanup())
      cursorState?.cleanup()
      cursorState?.element.remove()
    }
  }, [pathname])

  const isDemo = pathname?.startsWith('/yardify/dashboard') || pathname?.startsWith('/yardify/automation') || pathname?.startsWith('/yardify/leads')

  return (
    <>
      {!isDemo && (
        <>
          <div className={`site-loader ${ready ? 'site-loader-done' : ''}`} aria-hidden="true">
            <img src="/assets/yardify-logo.webp" alt="" />
            <span>YARDIFY · LANDSCAPING & CONSTRUCTION</span>
          </div>
          <div className="global-progress" aria-hidden="true" />
          <div className="floating-quote">
            <button type="button" data-magnetic onClick={() => document.querySelector<HTMLButtonElement>('.quote-pill')?.click()}>
              GET A FREE QUOTE <span>↗</span>
            </button>
          </div>
          <div className="mobile-cta">
            <button type="button" onClick={() => document.querySelector<HTMLButtonElement>('.quote-pill')?.click()}>
              GET A FREE QUOTE <span>↗</span>
            </button>
          </div>
        </>
      )}
    </>
  )
}
