import { ArrowLeft } from 'lucide-react'

type BackArrowProps = {
  onClick?: () => void
}

export default function BackArrow({ onClick }: BackArrowProps) {
  return (
    <ArrowLeft 
      className="h-5 w-5 text-gray-700 cursor-pointer" 
      onClick={onClick} 
    />
  )
}
