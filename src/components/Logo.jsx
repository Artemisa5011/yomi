// Logo desde public/logo.png. Uso: <Logo /> o <Logo className="h-20 w-20" />
export default function Logo({ className = 'h-14 w-14 object-contain mix-blend-screen', alt = 'Yomi No Hana' }) {
  const base = import.meta.env.BASE_URL || '/'
  return <img src={`${base}logo.jpg`} alt={alt} className={className} />
}