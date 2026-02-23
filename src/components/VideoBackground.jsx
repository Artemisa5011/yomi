export default function VideoBackground() {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      className="fixed inset-0 w-full h-full object-cover -z-20"
      aria-hidden
    >
      <source src="/video_3.mp4" type="video/mp4" />
    </video>
  )
}