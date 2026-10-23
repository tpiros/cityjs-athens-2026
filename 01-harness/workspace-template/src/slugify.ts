/** Turns a post title into a URL slug. */
export function slugify(title: string): string {
  return title.trim().replace(/\s+/g, "-");
}
