import { getCanon } from "@/lib/canon";
import { Temple } from "@/components/Temple";

export const dynamic = "force-dynamic";

export default async function Home() {
  const canon = await getCanon();
  return <Temple initialCanon={canon} />;
}
