import Sidebar from '@/components/admin/Sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      <Sidebar />
      <div className="flex-1 bg-lined-admin p-8">
        {children}
      </div>
    </div>
  )
}
