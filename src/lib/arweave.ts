export function getTagValue(tags: Tag[], name: string) {
  return tags.find((tag) => tag.name === name)?.value as string | undefined;
}
