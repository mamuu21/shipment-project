import LoginForm from "@/components/ui/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-[440px] mx-4">
        <LoginForm />
      </div>
    </div>
  )
}
