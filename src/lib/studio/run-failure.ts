/** Whether a failed generate should fall back to localPreviewHtml (offline create only). */
export function shouldApplyLocalPreviewOnFailure(online: boolean, revising: boolean): boolean {
  return !online && !revising;
}
