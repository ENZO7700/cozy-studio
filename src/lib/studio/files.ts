export type StudioFileEntry = {
  name: string;
  content: string;
};

/** Generated artifacts for the current preview (single-HTML scale). */
export function listStudioFiles(html: string, code: string): StudioFileEntry[] {
  const primary = html || code;
  if (!primary) return [];

  const files: StudioFileEntry[] = [{ name: "index.html", content: html || code }];
  if (code && html && code.trim() !== html.trim()) {
    files.push({ name: "source.html", content: code });
  }
  return files;
}

export function fileRefs(html: string, code: string): { name: string }[] {
  return listStudioFiles(html, code).map((f) => ({ name: f.name }));
}

export function getStudioFileContent(
  html: string,
  code: string,
  name: string,
): string | undefined {
  return listStudioFiles(html, code).find((f) => f.name === name)?.content;
}
