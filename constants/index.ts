export interface ThemeColors {
  primary: string;
  'primary-foreground': string;
  background: string;
  foreground: string;
  card: string;
  'card-foreground': string;
  muted: string;
  'muted-foreground': string;
  border: string;
  ring: string;
}

export interface Theme {
  name: string;
  id: string;
  light: ThemeColors;
  dark: ThemeColors;
}

export const themes: Theme[] = [
  {
    name: "Neutral",
    id: "neutral",
    light: {
      primary: "240 5.9% 10%",
      "primary-foreground": "0 0% 98%",
      background: "0 0% 100%",
      foreground: "240 10% 3.9%",
      card: "240 4.8% 95.9%",
      "card-foreground": "240 10% 3.9%",
      muted: "240 4.8% 95.9%",
      "muted-foreground": "240 3.8% 46.1%",
      border: "240 5.9% 90%",
      ring: "240 5.9% 10%",
    },
    dark: {
      primary: "0 0% 98%",
      "primary-foreground": "240 5.9% 10%",
      background: "240 10% 3.9%",
      foreground: "0 0% 98%",
      card: "240 10% 3.9%",
      "card-foreground": "0 0% 98%",
      muted: "240 3.7% 15.9%",
      "muted-foreground": "240 5% 64.9%",
      border: "240 3.7% 15.9%",
      ring: "240 4.9% 83.9%",
    },
  },
  {
    name: "Lime",
    id: "lime",
    light: {
      primary: "142 76% 36%",
      "primary-foreground": "0 0% 100%",
      background: "0 0% 100%",
      foreground: "240 10% 3.9%",
      card: "142 76% 96%",
      "card-foreground": "240 10% 3.9%",
      muted: "142 76% 96%",
      "muted-foreground": "142 70% 50%",
      border: "142 76% 80%",
      ring: "142 76% 36%",
    },
    dark: {
      primary: "142 71% 45%",
      "primary-foreground": "0 0% 100%",
      background: "240 10% 3.9%",
      foreground: "0 0% 98%",
      card: "240 10% 3.9%",
      "card-foreground": "0 0% 98%",
      muted: "240 3.7% 15.9%",
      "muted-foreground": "240 5% 64.9%",
      border: "240 3.7% 15.9%",
      ring: "142 71% 45%",
    },
  },
  {
    name: "Sky",
    id: "sky",
    light: {
      primary: "199 89% 48%",
      "primary-foreground": "0 0% 100%",
      background: "0 0% 100%",
      foreground: "240 10% 3.9%",
      card: "199 89% 96%",
      "card-foreground": "240 10% 3.9%",
      muted: "199 89% 96%",
      "muted-foreground": "199 89% 50%",
      border: "199 89% 80%",
      ring: "199 89% 48%",
    },
    dark: {
      primary: "199 89% 48%",
      "primary-foreground": "0 0% 100%",
      background: "240 10% 3.9%",
      foreground: "0 0% 98%",
      card: "240 10% 3.9%",
      "card-foreground": "0 0% 98%",
      muted: "240 3.7% 15.9%",
      "muted-foreground": "240 5% 64.9%",
      border: "240 3.7% 15.9%",
      ring: "199 89% 48%",
    },
  },
  {
    name: "Yellow",
    id: "yellow",
    light: {
      primary: "48 96% 53%",
      "primary-foreground": "0 0% 100%",
      background: "0 0% 100%",
      foreground: "240 10% 3.9%",
      card: "48 96% 96%",
      "card-foreground": "240 10% 3.9%",
      muted: "48 96% 96%",
      "muted-foreground": "48 96% 50%",
      border: "48 96% 80%",
      ring: "48 96% 53%",
    },
    dark: {
      primary: "48 96% 53%",
      "primary-foreground": "0 0% 100%",
      background: "240 10% 3.9%",
      foreground: "0 0% 98%",
      card: "240 10% 3.9%",
      "card-foreground": "0 0% 98%",
      muted: "240 3.7% 15.9%",
      "muted-foreground": "240 5% 64.9%",
      border: "240 3.7% 15.9%",
      ring: "48 96% 53%",
    },
  },
  {
    name: "Orange",
    id: "orange",
    light: {
      primary: "25 95% 53%",
      "primary-foreground": "0 0% 100%",
      background: "0 0% 100%",
      foreground: "240 10% 3.9%",
      card: "25 95% 96%",
      "card-foreground": "240 10% 3.9%",
      muted: "25 95% 96%",
      "muted-foreground": "25 95% 50%",
      border: "25 95% 80%",
      ring: "25 95% 53%",
    },
    dark: {
      primary: "25 95% 53%",
      "primary-foreground": "0 0% 100%",
      background: "240 10% 3.9%",
      foreground: "0 0% 98%",
      card: "240 10% 3.9%",
      "card-foreground": "0 0% 98%",
      muted: "240 3.7% 15.9%",
      "muted-foreground": "240 5% 64.9%",
      border: "240 3.7% 15.9%",
      ring: "25 95% 53%",
    },
  },
  {
    name: "Crimson",
    id: "crimson",
    light: {
      primary: "346 77% 50%",
      "primary-foreground": "0 0% 100%",
      background: "0 0% 100%",
      foreground: "240 10% 3.9%",
      card: "346 77% 96%",
      "card-foreground": "240 10% 3.9%",
      muted: "346 77% 96%",
      "muted-foreground": "346 77% 50%",
      border: "346 77% 80%",
      ring: "346 77% 50%",
    },
    dark: {
      primary: "346 77% 50%",
      "primary-foreground": "0 0% 100%",
      background: "240 10% 3.9%",
      foreground: "0 0% 98%",
      card: "240 10% 3.9%",
      "card-foreground": "0 0% 98%",
      muted: "240 3.7% 15.9%",
      "muted-foreground": "240 5% 64.9%",
      border: "240 3.7% 15.9%",
      ring: "346 77% 50%",
    },
  },
];