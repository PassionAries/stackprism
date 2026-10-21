import { readFile } from 'node:fs/promises'
import { chromium, errors, type Browser, type Frame, type Page, type Response } from 'playwright-core'
import { buildHeaderRecord } from '../background/headers'
import { mergeTechnologyRecords } from '../background/merge'
import { probePageResources, selectPageDetectorRules } from '../background/page-rule-filter'
import type { PageDetectionResult, TechnologyRecord } from '../types/rules'
import { DetectionDeadline } from './deadline.js'
import { SubresourceHeaders, SUBRESOURCE_RESPONSE_LIMIT, type CapturedNetwork } from './subresource-headers.js'
import {
  StackPrismError,
  type DetectedTechnology,
  type DetectionOptions,
  type DetectionReport,
  type PageObservation,
  type ScanOptions
} from './types.js'

export { StackPrismError } from './types.js'
export type {
  DetectablePage,
  DetectedTechnology,
  DetectionErrorCode,
  DetectionOptions,
  DetectionReport,
  NetworkResponseDetection,
  PageObservation,
  ScanOptions
} from './types.js'

declare const __STACKPRISM_DETECTOR_SOURCE__: string
declare const __STACKPRISM_SDK_VERSION__: string

interface BundledRules {
  version: string
  sha256: string
  page: Record<string, unknown>
  headers: Record<string, unknown>
}

let bundledRules: Promise<BundledRules> | undefined
const loadRules = (): Promise<BundledRules> => {
  bundledRules ??= readFile(new URL('./rules.json', import.meta.url), 'utf8')
    .then(JSON.parse)
    .catch(error => {
      bundledRules = undefined
      throw error
    })
  return bundledRules
}

const validateUrl = (value: string): string => {
  let url: URL
  try {
    if (typeof value !== 'string') throw new Error('Expected a string')
    url = new URL(value)
  } catch {
    throw new StackPrismError('INVALID_ARGUMENT', 'Expected an absolute HTTP(S) URL')
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new StackPrismError('INVALID_ARGUMENT', 'Only HTTP(S) URLs without embedded credentials are supported')
  }
  return url.href
}

const validatePage = (page: Page): void => {
  if (!page || ['evaluate', 'mainFrame', 'isClosed', 'url', 'on', 'off'].some(method => typeof page[method as keyof Page] !== 'function')) {
    throw new StackPrismError('INVALID_ARGUMENT', 'Expected a Playwright Page')
  }
  if (page.isClosed()) throw new StackPrismError('PAGE_CLOSED', 'Page is closed')
}

const validateDetectionOptions = (options: DetectionOptions): void => {
  if (!options || typeof options !== 'object' || Array.isArray(options))
    throw new StackPrismError('INVALID_ARGUMENT', 'Expected an options object')
}

const wrapFailure = (error: unknown, page?: Page): StackPrismError => {
  if (error instanceof StackPrismError) return error
  if (
    error instanceof errors.TimeoutError ||
    (error instanceof Error && error.message.includes('StackPrism detection deadline exceeded'))
  ) {
    return new StackPrismError('TIMEOUT', 'Detection deadline exceeded', { cause: error })
  }
  if (page?.isClosed()) return new StackPrismError('PAGE_CLOSED', 'Page closed during detection', { cause: error })
  return new StackPrismError('DETECTION_FAILED', 'Page detection failed', { cause: error })
}

const collectSnapshot = async (page: Page, rules: BundledRules, deadline: DetectionDeadline): Promise<PageDetectionResult> => {
  const initialUrl = page.url()
  let navigated = false
  const onNavigation = (frame: Frame) => {
    if (frame === page.mainFrame()) navigated = true
  }
  page.on('framenavigated', onNavigation)
  try {
    const probe = await deadline.run(() => page.evaluate(probePageResources))
    const selectedRules = selectPageDetectorRules(rules.page, probe)
    // Playwright evaluates string expressions without invoking them. Serialize rule data as JSON,
    // then explicitly invoke the trusted browser bundle; never interpolate page text as source code.
    const snapshot = await deadline.run(() =>
      page.evaluate<PageDetectionResult>(
        `(${__STACKPRISM_DETECTOR_SOURCE__})(${JSON.stringify({ rules: selectedRules, budgetMs: deadline.remaining() })})`
      )
    )
    if (navigated || page.url() !== initialUrl || snapshot.url !== initialUrl) {
      throw new StackPrismError('PAGE_CHANGED', 'Main frame navigated during detection; retry after it settles')
    }
    return snapshot
  } catch (error) {
    if (
      !(error instanceof StackPrismError) &&
      (navigated || (error instanceof Error && /Execution context was destroyed|Cannot find context with specified id/.test(error.message)))
    ) {
      throw new StackPrismError('PAGE_CHANGED', 'Main frame navigated during detection', { cause: error })
    }
    throw error
  } finally {
    page.off('framenavigated', onNavigation)
  }
}

const reportTechnologies = (items: TechnologyRecord[]): DetectedTechnology[] => {
  const confidence = { 高: 'high', 中: 'medium', 低: 'low' } as const
  const technologies: TechnologyRecord[] = mergeTechnologyRecords(items)
  return technologies
    .map(technology => ({
      name: technology.name,
      category: technology.category,
      confidence: confidence[technology.confidence],
      evidence: technology.evidence ?? [],
      ...(technology.kind ? { kind: technology.kind } : {}),
      ...(technology.source ? { source: technology.source } : {}),
      ...(technology.version ? { version: technology.version } : {}),
      ...(technology.url ? { url: technology.url } : {})
    }))
    .sort((a, b) => (a.category < b.category ? -1 : a.category > b.category ? 1 : a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
}

const buildReport = (
  snapshot: PageDetectionResult,
  headerTechnologies: TechnologyRecord[],
  httpStatus: number | null,
  rules: BundledRules,
  deadline: DetectionDeadline,
  network: (CapturedNetwork & { observationMs: number }) | null
): DetectionReport => {
  return {
    schemaVersion: 1,
    engine: { name: 'stackprism', version: __STACKPRISM_SDK_VERSION__ },
    rules: { version: rules.version, sha256: rules.sha256 },
    url: snapshot.url,
    title: snapshot.title,
    generatedAt: snapshot.generatedAt,
    durationMs: Math.round(performance.now() - deadline.startedAt),
    technologies: reportTechnologies([...snapshot.technologies, ...headerTechnologies]),
    coverage: {
      page: 'sampled_main_frame',
      responseHeaders: httpStatus === null ? 'not_observed' : 'main_document',
      subresourceHeaders: network === null ? 'not_observed' : 'sampled',
      httpStatus,
      unobserved: [
        'iframe_internals',
        ...(httpStatus === null ? ['response_headers'] : []),
        ...(network === null ? ['subresource_headers'] : []),
        'continuous_mutations',
        'bundle_license_sampling',
        'wordpress_supplementary_fetches'
      ],
      limits: { htmlCharacters: 500_000, bodyCharacters: 120_000, cssVariables: 500 }
    },
    network: {
      observationMs: network?.observationMs ?? 0,
      responseLimit: SUBRESOURCE_RESPONSE_LIMIT,
      observedResponses: network?.observedResponses ?? 0,
      skippedResponses: network?.skippedResponses ?? 0,
      failedResponses: network?.failedResponses ?? 0,
      responses: (network?.responses ?? []).map(response => ({
        url: response.url,
        relation: new URL(response.url).origin === new URL(snapshot.url).origin ? 'same_origin' : 'cross_origin',
        resourceType: response.resourceType,
        status: response.status,
        technologies: reportTechnologies(response.technologies)
      }))
    },
    resources: {
      total: snapshot.resources.total,
      sampledScripts: snapshot.resources.scripts.length,
      sampledStylesheets: snapshot.resources.stylesheets.length,
      cssVariableCount: snapshot.resources.cssVariableCount
    }
  }
}

/** Inspect a settled caller-owned page. Never navigates, refetches headers, or closes the page/browser. */
export async function detectPage(page: Page, options: DetectionOptions = {}): Promise<DetectionReport> {
  validateDetectionOptions(options)
  validatePage(page)
  validateUrl(page.url())
  const deadline = new DetectionDeadline(options.timeoutMs, options.signal)
  try {
    const rules = await deadline.run(loadRules)
    const snapshot = await collectSnapshot(page, rules, deadline)
    deadline.remaining()
    return buildReport(snapshot, [], null, rules, deadline, null)
  } catch (error) {
    throw wrapFailure(error, page)
  } finally {
    deadline.dispose()
  }
}

// A navigation response precedes its document commit. Consume it at commit so a
// late attachment or same-URL reload can never inherit an older document's headers.
const createPageObservation = (page: Page, rules: BundledRules, deadline: DetectionDeadline): PageObservation => {
  if (page.isClosed()) throw new StackPrismError('PAGE_CLOSED', 'Page closed before observation started')
  const subresourceHeaders = new SubresourceHeaders(page, rules.headers)
  let documentResponse: Response | null = null
  let pendingNavigation: Response | null = null
  let generation = 0
  let committedAt = performance.now()
  let consumed = false
  let disposed = false
  const onResponse = (response: Response) => {
    if (response.request().isNavigationRequest() && response.frame() === page.mainFrame()) pendingNavigation = response
  }
  const onNavigation = (frame: Frame) => {
    if (frame !== page.mainFrame()) return
    generation++
    if (pendingNavigation) {
      documentResponse = pendingNavigation.url().split('#')[0] === frame.url().split('#')[0] ? pendingNavigation : null
    } else if (!/^https?:/i.test(frame.url())) {
      documentResponse = null
    }
    // History/hash navigation has no new response and keeps the current document's headers.
    pendingNavigation = null
    committedAt = performance.now()
  }
  const onClose = () => deadline.interrupt(new StackPrismError('PAGE_CLOSED', 'Page closed during observation'))
  page.on('response', onResponse)
  page.on('framenavigated', onNavigation)
  page.on('close', onClose)
  const dispose = () => {
    if (disposed) return
    disposed = true
    subresourceHeaders.dispose()
    page.off('response', onResponse)
    page.off('framenavigated', onNavigation)
    page.off('close', onClose)
    // Wake any header read/evaluation wait, including disposal by the caller.
    deadline.interrupt(new StackPrismError('OBSERVATION_CLOSED', 'Observation is closed'))
    deadline.dispose()
  }
  return {
    dispose,
    async detect() {
      deadline.remaining()
      if (consumed) throw new StackPrismError('OBSERVATION_CLOSED', 'Observation can only be detected once')
      consumed = true
      const initialGeneration = generation
      const response = documentResponse
      const observationMs = Math.max(0, Math.round(performance.now() - committedAt))
      try {
        validateUrl(page.url())
        if (pendingNavigation) throw new StackPrismError('PAGE_CHANGED', 'Wait for main document navigation to settle')
        const network = await deadline.run(() => subresourceHeaders.finish())
        const responseHeaders = response ? await deadline.run(() => response.headersArray()) : []
        const snapshot = await collectSnapshot(page, rules, deadline)
        if (generation !== initialGeneration || pendingNavigation || documentResponse !== response) {
          throw new StackPrismError('PAGE_CHANGED', 'Main document changed during observed detection')
        }
        const headerRecord = response
          ? buildHeaderRecord(
              {
                url: response.url(),
                type: 'main_frame',
                method: response.request().method(),
                statusCode: response.status(),
                responseHeaders
              },
              rules.headers,
              {}
            )
          : null
        deadline.remaining()
        return buildReport(snapshot, headerRecord?.technologies ?? [], response?.status() ?? null, rules, deadline, {
          ...network,
          observationMs
        })
      } catch (error) {
        throw wrapFailure(error, page)
      } finally {
        dispose()
      }
    }
  }
}

/**
 * Attach before caller-controlled navigation; await readiness, then call detect() once.
 * The total budget includes caller waiting. Completion, abort, expiry or dispose detaches
 * listeners without navigating/closing the page or cancelling caller Playwright operations.
 */
export async function observePage(page: Page, options: DetectionOptions = {}): Promise<PageObservation> {
  validateDetectionOptions(options)
  validatePage(page)
  let observation: PageObservation | undefined
  const deadline = new DetectionDeadline(options.timeoutMs, options.signal, () => observation?.dispose())
  try {
    const rules = await deadline.run(loadRules)
    deadline.remaining()
    observation = createPageObservation(page, rules, deadline)
    return observation
  } catch (error) {
    deadline.dispose()
    throw wrapFailure(error, page)
  }
}

/** Launch installed Chrome, navigate once, inspect the main document, then close the owned browser. */
export async function scanUrl(url: string, options: ScanOptions = {}): Promise<DetectionReport> {
  validateDetectionOptions(options)
  const target = validateUrl(url)
  if (options.executablePath !== undefined && (typeof options.executablePath !== 'string' || !options.executablePath.trim())) {
    throw new StackPrismError('INVALID_ARGUMENT', 'executablePath must be a nonempty string')
  }
  const observationMs = options.observationMs ?? 1000
  if (!Number.isSafeInteger(observationMs) || observationMs < 0 || observationMs > 5000) {
    throw new StackPrismError('INVALID_ARGUMENT', 'observationMs must be an integer between 0 and 5000')
  }
  let observation: PageObservation | undefined
  const deadline = new DetectionDeadline(options.timeoutMs, options.signal, () => observation?.dispose())
  let browser: Browser | undefined
  let launching: Promise<Browser> | undefined
  let page: Page | undefined
  try {
    const rules = await deadline.run(loadRules)
    launching = chromium.launch({
      headless: true,
      ...(options.executablePath ? { executablePath: options.executablePath } : { channel: 'chrome' }),
      timeout: deadline.remaining()
    })
    try {
      browser = await deadline.run(() => launching!)
    } catch (error) {
      if (error instanceof StackPrismError || error instanceof errors.TimeoutError) throw error
      throw new StackPrismError('BROWSER_LAUNCH_FAILED', 'Could not launch Chrome; install Chrome or set executablePath', { cause: error })
    }
    page = await deadline.run(() => browser!.newPage())
    observation = createPageObservation(page, rules, deadline)
    let response: Response | null
    try {
      response = await deadline.run(() => page!.goto(target, { waitUntil: 'load', timeout: deadline.remaining() }))
    } catch (error) {
      if (error instanceof StackPrismError || error instanceof errors.TimeoutError) throw error
      throw new StackPrismError('NAVIGATION_FAILED', 'Main document navigation failed', { cause: error })
    }
    validateUrl(page.url())
    if (!response) throw new StackPrismError('NAVIGATION_FAILED', 'Navigation produced no main document response')
    // Track document identity as well as URL: a same-URL reload must not reuse old headers.
    let navigated = false
    const onNavigation = (frame: Frame) => {
      if (frame === page!.mainFrame()) navigated = true
    }
    page.on('framenavigated', onNavigation)
    try {
      await deadline.wait(observationMs)
      const report = await observation.detect()
      if (navigated || report.url.split('#')[0] !== response.url().split('#')[0]) {
        throw new StackPrismError('PAGE_CHANGED', 'Main document changed after navigation')
      }
      return { ...report, network: { ...report.network, observationMs } }
    } finally {
      page.off('framenavigated', onNavigation)
    }
  } catch (error) {
    throw wrapFailure(error, page)
  } finally {
    deadline.dispose()
    observation?.dispose()
    // A cancelled launch can resolve after the caller's deadline; still reap its browser.
    browser ??= await launching?.catch(() => undefined)
    await browser?.close()
  }
}
