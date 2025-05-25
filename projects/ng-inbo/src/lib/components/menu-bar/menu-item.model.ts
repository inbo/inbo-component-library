export type InboMenuItem = {
  name: string;
  externalLink?: boolean;
} & (
  | { url: Array<string>; submenuItems?: never }
  | { url?: never; submenuItems: Array<Omit<InboMenuItem, 'submenuItems'>> }
);
