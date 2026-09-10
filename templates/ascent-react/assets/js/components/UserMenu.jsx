import { Link, router, usePage } from '@inertiajs/react'
import Menu from '@/components/ui/menu/Menu.jsx'
import Avatar from '@/components/ui/avatar/Avatar.jsx'
import Plus from '@/components/ui/icons/Plus.jsx'
import User from '@/components/ui/icons/User.jsx'
import InfoCircle from '@/components/ui/icons/InfoCircle.jsx'
import SignOut from '@/components/ui/icons/SignOut.jsx'

export default function UserMenu({ id }) {
  const { loggedInUser: user, teams = [], currentTeam } = usePage().props
  const itemClass =
    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800'
  return (
    <Menu
      id={id}
      className="w-64 max-w-[calc(100vw-2rem)]"
      aria-label="Account menu"
    >
      <div className="mb-1 border-b border-gray-200 px-3 py-3 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Avatar
            src={user?.currentAvatarUrl}
            alt=""
            className="bg-indigo-500 text-white"
          >
            {user?.initials}
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user?.fullName}</p>
            <p className="truncate text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>
      {teams.length > 0 && (
        <>
          <p className="px-3 py-2 text-xs font-bold uppercase text-gray-500">
            Teams
          </p>
          {teams.map((team) => (
            <button
              key={team.id}
              type="button"
              role="menuitem"
              className={itemClass}
              onClick={() => router.post(`/teams/${team.id}/switch`)}
            >
              <Avatar src={team.logoUrl} alt="" className="size-8 rounded-lg">
                {team.name.charAt(0)}
              </Avatar>
              <span>{team.name}</span>
              {(team.isCurrent || currentTeam?.id === team.id) && (
                <span className="ml-auto h-2 w-2 rounded-full bg-sky-500">
                  <span className="sr-only">Current team</span>
                </span>
              )}
            </button>
          ))}
          <Link href="/team/create" role="menuitem" className={itemClass}>
            <Plus className="h-4 w-4" />
            New team
          </Link>
          <hr className="my-1 border-gray-200 dark:border-gray-700" />
        </>
      )}
      <Link href="/profile" role="menuitem" className={itemClass}>
        <User className="h-4 w-4" />
        My profile
      </Link>
      <Link href="/help" role="menuitem" className={itemClass}>
        <InfoCircle className="h-4 w-4" />
        Help
      </Link>
      <hr className="my-1 border-gray-200 dark:border-gray-700" />
      <button
        type="button"
        role="menuitem"
        className={`${itemClass} text-red-500`}
        onClick={() => router.delete('/logout')}
      >
        <SignOut className="h-4 w-4" />
        Sign out
      </button>
    </Menu>
  )
}
