export type Theme = {
  name: string;
  label: string;
  colors: {
    light: {
      primary: string;
      primaryForeground: string;
      primaryGlow: string;
      ring: string;
    };
    dark: {
      primary: string;
      primaryForeground: string;
      primaryGlow: string;
      ring: string;
    };
  };
};

export const themes: Theme[] = [
  {
    name: "teal",
    label: "Teal (Padrão)",
    colors: {
      light: {
        primary: "190 70% 40%",
        primaryForeground: "180 10% 98%",
        primaryGlow: "190 80% 80%",
        ring: "190 70% 40%",
      },
      dark: {
        primary: "190 70% 45%",
        primaryForeground: "222.2 47.4% 11.2%",
        primaryGlow: "190 70% 38%",
        ring: "190 70% 45%",
      },
    },
  },
  {
    name: "ocean-blue",
    label: "Azul Oceano",
    colors: {
      light: {
        primary: "210 80% 50%",
        primaryForeground: "210 20% 98%",
        primaryGlow: "210 90% 85%",
        ring: "210 80% 50%",
      },
      dark: {
        primary: "210 80% 55%",
        primaryForeground: "210 20% 98%",
        primaryGlow: "210 80% 45%",
        ring: "210 80% 55%",
      },
    },
  },
  {
    name: "crimson-red",
    label: "Vermelho Carmesim",
    colors: {
      light: {
        primary: "350 75% 50%",
        primaryForeground: "350 20% 98%",
        primaryGlow: "350 85% 85%",
        ring: "350 75% 50%",
      },
      dark: {
        primary: "350 75% 55%",
        primaryForeground: "350 20% 98%",
        primaryGlow: "350 75% 45%",
        ring: "350 75% 55%",
      },
    },
  },
  {
    name: "forest-green",
    label: "Verde Floresta",
    colors: {
      light: {
        primary: "140 60% 35%",
        primaryForeground: "140 15% 98%",
        primaryGlow: "140 70% 80%",
        ring: "140 60% 35%",
      },
      dark: {
        primary: "140 60% 40%",
        primaryForeground: "140 15% 98%",
        primaryGlow: "140 60% 30%",
        ring: "140 60% 40%",
      },
    },
  },
  {
    name: "royal-purple",
    label: "Roxo Real",
    colors: {
      light: {
        primary: "260 65% 55%",
        primaryForeground: "260 20% 98%",
        primaryGlow: "260 75% 88%",
        ring: "260 65% 55%",
      },
      dark: {
        primary: "260 65% 60%",
        primaryForeground: "260 20% 98%",
        primaryGlow: "260 65% 50%",
        ring: "260 65% 60%",
      },
    },
  },
  {
    name: "sunset-orange",
    label: "Laranja Poente",
    colors: {
      light: {
        primary: "25 90% 50%",
        primaryForeground: "25 20% 98%",
        primaryGlow: "25 95% 85%",
        ring: "25 90% 50%",
      },
      dark: {
        primary: "25 90% 55%",
        primaryForeground: "25 20% 98%",
        primaryGlow: "25 90% 45%",
        ring: "25 90% 55%",
      },
    },
  },
  {
    name: "graphite-gray",
    label: "Cinza Grafite",
    colors: {
      light: {
        primary: "220 10% 40%",
        primaryForeground: "220 10% 98%",
        primaryGlow: "220 15% 80%",
        ring: "220 10% 40%",
      },
      dark: {
        primary: "220 10% 55%",
        primaryForeground: "220 10% 98%",
        primaryGlow: "220 10% 30%",
        ring: "220 10% 55%",
      },
    },
  },
  {
    name: "goldenrod-yellow",
    label: "Amarelo Dourado",
    colors: {
      light: {
        primary: "45 90% 50%",
        primaryForeground: "45 30% 10%",
        primaryGlow: "45 95% 85%",
        ring: "45 90% 50%",
      },
      dark: {
        primary: "45 90% 55%",
        primaryForeground: "45 30% 10%",
        primaryGlow: "45 90% 45%",
        ring: "45 90% 55%",
      },
    },
  },
  {
    name: "magenta-pink",
    label: "Rosa Magenta",
    colors: {
      light: {
        primary: "320 70% 50%",
        primaryForeground: "320 20% 98%",
        primaryGlow: "320 80% 85%",
        ring: "320 70% 50%",
      },
      dark: {
        primary: "320 70% 55%",
        primaryForeground: "320 20% 98%",
        primaryGlow: "320 70% 45%",
        ring: "320 70% 55%",
      },
    },
  },
  {
    name: "sky-blue",
    label: "Azul Céu",
    colors: {
      light: {
        primary: "200 85% 50%",
        primaryForeground: "200 20% 98%",
        primaryGlow: "200 90% 85%",
        ring: "200 85% 50%",
      },
      dark: {
        primary: "200 85% 55%",
        primaryForeground: "200 20% 98%",
        primaryGlow: "200 85% 45%",
        ring: "200 85% 55%",
      },
    },
  },
];