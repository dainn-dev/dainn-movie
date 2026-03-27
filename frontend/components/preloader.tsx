import Image from "next/image"

export default function Preloader() {
  return (
    <div className="preloader">
      <Image className="logo" src="/images/logo1.png" alt="Open Pediatrics Logo" width={119} height={58} priority />
      <div className="status">
        <span></span>
        <span></span>
      </div>
    </div>
  )
}
