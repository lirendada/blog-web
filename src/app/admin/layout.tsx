import { auth } from '@/../auth'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/admin/login')
  }

  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      <Sidebar />
      <div className="flex-1 bg-lined-admin p-8">
        {children}
      </div>
    </div>
  )
}
