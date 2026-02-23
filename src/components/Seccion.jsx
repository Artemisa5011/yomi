export default function Seccion({ title, children, className = '' }) {
  return (
    <section className={`my-8 p-6 rounded-[50px] border-4 border-red-900/50 bg-black/60 text-center shadow-[0_-5px_15px_rgba(255,0,0,0.2)] ${className}`}>
      {title && (
        <h2 className="text-2xl text-red-400 mb-4 text-shadow-[0_0_8px_white]">{title}</h2>
      )}
      {children}
    </section>
  )
}