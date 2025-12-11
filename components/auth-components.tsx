import { signIn, signOut } from "@/lib/auth"

export function SignIn({ 
  provider, 
  className, 
  ...props 
}: { provider?: string, className?: string } & React.ComponentPropsWithRef<"button">) {
  return (
    <form
      action={async () => {
        "use server"
        await signIn(provider)
      }}
    >
      <button className={className || "bg-neutral-700 text-white p-2 rounded-md"} {...props}>
        Zaloguj się {provider ? `z ${provider}` : ""}
      </button>
    </form>
  )
}

export function SignOut({ 
  className, 
  ...props 
}: { className?: string } & React.ComponentPropsWithRef<"button">) {
  return (
    <form
      action={async () => {
        "use server"
        await signOut()
      }}
      className="w-full"
    >
      <button className={className || "bg-neutral-700 text-white p-2 rounded-md"} {...props}>
        Wyloguj się
      </button>
    </form>
  )
}