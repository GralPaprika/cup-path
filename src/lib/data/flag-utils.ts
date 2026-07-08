/** FIFA official flag image URL (same source as World Football Ranking API) */
export function getFifaFlagUrl(fifaCode: string): string {
  return `https://api.fifa.com/api/v3/picture/flags-sq-2/${fifaCode.toUpperCase()}`;
}

/** @deprecated Use getFifaFlagUrl — kept as alias for compatibility */
export function getDefaultFlagUrl(fifaCode: string): string {
  return getFifaFlagUrl(fifaCode);
}

export function parseFifaCodeFromFlagUrl(flagUrl: string): string | undefined {
  const match = flagUrl.match(/\/([A-Z]{3})$/i);
  return match?.[1]?.toUpperCase();
}

export function parseFlagUrl(row: Record<string, unknown>): string | undefined {
  const direct =
    row.flag ??
    row.flagUrl ??
    row.flag_url ??
    row.countryFlag ??
    row.country_flag ??
    row.image;

  if (typeof direct === "string" && direct.startsWith("http")) return direct;

  const country = row.country;
  if (country && typeof country === "object") {
    const countryObj = country as Record<string, unknown>;
    const nested =
      countryObj.flag ??
      countryObj.flagUrl ??
      countryObj.flag_url ??
      countryObj.image;
    if (typeof nested === "string" && nested.startsWith("http")) return nested;
  }

  return undefined;
}

export function parseFifaCode(row: Record<string, unknown>): string | undefined {
  const flagUrl = parseFlagUrl(row);
  if (flagUrl) {
    const fromFlag = parseFifaCodeFromFlagUrl(flagUrl);
    if (fromFlag) return fromFlag;
  }

  const direct =
    row.fifa_code ??
    row.fifaCode ??
    row.countryCode ??
    row.country_code ??
    row.code ??
    row.nameCode;

  if (typeof direct === "string" && direct.length === 3) {
    return direct.toUpperCase();
  }

  const country = row.country;
  if (country && typeof country === "object") {
    const countryObj = country as Record<string, unknown>;
    const alpha3 = countryObj.alpha3 ?? countryObj.iso3 ?? countryObj.fifa;
    if (typeof alpha3 === "string" && alpha3.length === 3) {
      return alpha3.toUpperCase();
    }
  }

  return undefined;
}

export function parseApiSourceDate(
  payload: unknown,
  fallback: string,
): string {
  if (!payload || typeof payload !== "object") return fallback;

  const date = (payload as Record<string, unknown>).date;
  if (typeof date !== "string") return fallback;

  const parsed = new Date(date);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return fallback;
}
