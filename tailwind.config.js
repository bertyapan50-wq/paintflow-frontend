/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		fontFamily: {
  			heading: ['var(--font-heading)'],
  			body: ['var(--font-body)'],
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
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
  			}
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
			moonPulse: {
    '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
    '50%':      { opacity: '1',   transform: 'scale(1.08)' }
},
starRay: {
    '0%':   { opacity: '0.3', transform: 'translate(-50%, -50%) scaleY(0.6) rotate(var(--ray-deg))' },
    '100%': { opacity: '0.9', transform: 'translate(-50%, -50%) scaleY(1.2) rotate(var(--ray-deg))' }
},
spinRays: {
    '0%':   { transform: 'rotate(0deg)'   },
    '100%': { transform: 'rotate(360deg)' },
},
corePulse: {
    '0%':   { opacity: '0.7', transform: 'scale(0.85)' },
    '100%': { opacity: '1',   transform: 'scale(1.15)' }
},
			twinkle: {
				'0%, 100%': { opacity: '0.2', transform: 'scale(0.8)' },
				'50%':      { opacity: '1',   transform: 'scale(1.3)' }
			},
		},
		animation: {
    'accordion-down': 'accordion-down 0.2s ease-out',
    'accordion-up':   'accordion-up 0.2s ease-out',
    moonPulse:  'moonPulse 3s ease-in-out infinite',
    twinkle:    'twinkle 2.4s ease-in-out infinite',
    starRay:    'starRay 3s ease-in-out infinite alternate',
    corePulse:  'corePulse 2s ease-in-out infinite alternate',
    spinRays:   'spinRays 6s linear infinite',
}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
