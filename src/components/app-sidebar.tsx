import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar'
import { Button } from './ui/button'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible='offcanvas' variant='floating' {...props}>
      <SidebarHeader>
        <Button>eteaf</Button>
      </SidebarHeader>
      <SidebarContent>
        <h1>Hello WOrld</h1>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}