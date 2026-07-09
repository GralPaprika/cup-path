import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { LOCALE_COOKIE } from "./constants";
import { routing, type AppLocale } from "./routing";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;

  let locale: AppLocale = routing.defaultLocale;
  if (cookieLocale && routing.locales.includes(cookieLocale as AppLocale)) {
    locale = cookieLocale as AppLocale;
  }

  const [messages, teams] = await Promise.all([
    import(`../../messages/${locale}.json`),
    import(`../../messages/teams/${locale}.json`),
  ]);

  return {
    locale,
    messages: {
      ...messages.default,
      teams: teams.default,
    },
  };
});
