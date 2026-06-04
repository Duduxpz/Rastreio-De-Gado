import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Fundo em camadas — profundidade real
        bg: {
          base: '#0B1A12',   // fundo da página (mais escuro)
          surface: '#112318',   // cards e sidebar
          elevated: '#163020',   // hover, dropdown, modais
          border: '#1E3D28',   // bordas sutis
          muted: '#1A2E20',   // faixas zebradas em tabelas
        },
        // Primária — verde vibrante (ação, seleção ativa)
        brand: {
          DEFAULT: '#22C55E',   // green-500
          light: '#4ADE80',   // green-400
          dim: '#16A34A',   // green-600
          subtle: '#14532D22', // fundo de badge/tag (baixa opacidade)
        },
        // Laranja — destaque e CTA principal
        cta: {
          DEFAULT: '#F97316',   // orange-500
          light: '#FB923C',   // orange-400
          dim: '#EA580C',   // orange-600
          subtle: '#43180522', // fundo de badge
        },
        // Semânticas
        success: { DEFAULT: '#22C55E', subtle: '#14532D33' },
        warning: { DEFAULT: '#EAB308', subtle: '#71350033' },
        danger: { DEFAULT: '#EF4444', subtle: '#7F1D1D33' },
        info: { DEFAULT: '#38BDF8', subtle: '#0C4A6E33' },
        // Texto em camadas
        text: {
          primary: '#F0FDF4',  // títulos e valores
          secondary: '#86EFAC',  // labels e subtítulos (green-300)
          muted: '#4ADE8066', // placeholders e info baixa prioridade
          inverse: '#0B1A12',  // texto sobre fundo claro
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        xxl: '32px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
