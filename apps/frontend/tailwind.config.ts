
import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import animationPlugin from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	safelist: [
		{
			pattern: /icon-circle-(blue|green|purple|pink|orange|teal|red|yellow|emerald|indigo|gray)/,
		}
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				habit: {
					health: '#F97316',
					work: '#0EA5E9',
					learning: '#8B5CF6',
					personal: '#D946EF',
					other: '#8A898C'
				},
				habitly: {
					blue: '#64B5F6',
					green: '#81C784',
					purple: '#9575CD',
					pink: '#F06292',
					orange: '#FFB74D',
					teal: '#4DB6AC'
				}
			},
			backgroundImage: {
				'streak-gradient': 'linear-gradient(135deg, #9b87f5 0%, #7e69ab 100%)',
				'hero-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
				'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
				'card-gradient-dark': 'linear-gradient(135deg, rgba(31,41,55,0.9) 0%, rgba(31,41,55,0.7) 100%)',
				'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
				'glass-dark': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0))',
				'primary-gradient': 'linear-gradient(135deg, #9b87f5 0%, #f47fff 50%, #64b5f6 100%)',
				'success-gradient': 'linear-gradient(135deg, #81c784 0%, #4db6ac 100%)',
				'warning-gradient': 'linear-gradient(135deg, #ffb74d 0%, #ff8a65 100%)',
			},
			boxShadow: {
				'habit-glow': '0 0 15px rgba(155, 135, 245, 0.5)',
				'habit-glow-dark': '0 0 15px rgba(155, 135, 245, 0.3)',
				'streak': '0 4px 10px rgba(155, 135, 245, 0.3)',
				'badge': '0 4px 12px rgba(0, 0, 0, 0.08)',
				'quote': '0 4px 15px rgba(155, 135, 245, 0.12)',
				'quote-dark': '0 4px 15px rgba(155, 135, 245, 0.05)',
				'glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
				'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.37)',
				'floating': '0 10px 30px rgba(155, 135, 245, 0.15)',
				'floating-lg': '0 20px 40px rgba(155, 135, 245, 0.2)',
				'glow': '0 0 25px rgba(155, 135, 245, 0.4)',
				'glow-lg': '0 0 40px rgba(155, 135, 245, 0.6)',
				'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'pulse-scale': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.05)' },
				},
				'slide-in': {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				'float': {
					'0%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-5px)' },
					'100%': { transform: 'translateY(0px)' },
				},
				'badge-glow': {
					'from': { boxShadow: '0 0 10px rgba(155, 135, 245, 0.3)' },
					'to': { boxShadow: '0 0 15px rgba(155, 135, 245, 0.6)' },
				},
				'logo-spin': {
					'from': { transform: 'rotate(0deg)' },
					'to': { transform: 'rotate(360deg)' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-scale': 'pulse-scale 1s ease-in-out',
				'slide-in': 'slide-in 0.3s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'float': 'float 5s ease-in-out infinite',
				'badge-glow': 'badge-glow 2s infinite alternate',
				'logo-spin': 'logo-spin 20s linear infinite',
				'shimmer': 'shimmer 1.5s infinite',
				'subtle-bounce': 'subtle-bounce 2s ease-in-out infinite',
				'gentle-glow': 'gentle-glow 3s ease-in-out infinite',
			}
		}
	},
	plugins: [animationPlugin],
} satisfies Config;
