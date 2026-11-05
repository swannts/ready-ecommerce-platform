import { ManagementShell } from "@/components/ManagementShell";

export default function SecureLayout({ children }: { children: React.ReactNode }) {
  return <ManagementShell>{children}</ManagementShell>;
}
