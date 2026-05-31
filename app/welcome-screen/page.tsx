import { getSettings } from "@/lib/settings";
import { WelcomeScreen } from "@/components/WelcomeScreen";

export const dynamic = "force-dynamic";

export default async function WelcomeScreenPage() {
  const s = await getSettings();
  return (
    <WelcomeScreen
      coupleName={`${s.bride_name} & ${s.groom_name}`}
      background={s.background_color}
      heading={s.heading_color}
      accent={s.accent_color}
      text={s.text_color}
      heroImage={s.hero_image_url}
    />
  );
}
